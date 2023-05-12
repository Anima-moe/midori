import * as app from '@/app.ts'
import { updateAnime } from '@/namespace/cli.ts'
import axios from 'npm:axios'
import { isSupportedImage, safeSendMessage, sendErrorEmbed, sendSuccessEmbed } from '@/namespace/utils.native.ts'
import { Anima } from "../../../@types/anima.d.ts";
import { getLocaleMetadata } from "@/namespace/anime.ts";
import { NormalMessage } from '../../../@types/event.d.ts';

export default new app.command.CustomCommand({
  name: 'animeupdate',
  aliases: ['au', 'animeupdate', 'aniupdate', 'aniupdt', 'updateanime'],
  description: 'command.animeupdate.description',
  usage: 'command.animeupdate.usage',
  category: 'category.anima',
  positionalArgs: [
    {
      name: 'identifier',	
      description: 'command.command.animeupdate.description',
      required: true,
      validate: (value: string) => {
        if ((!value.startsWith('https://') || !value.startsWith('http://')) && Number.isNaN(value)) {
          return false
        }

        return true
      }
    }
  ],
  allowedRoles: ['staff', 'mod', 'helping hands'],
  beforeExecute: async (message) => {
    message.customData = {
      stateMessage: await sendSuccessEmbed(message, 'command.animeupdate.state.start')
    }
  },
  execute: async (message) => {
    try {
      message.customData.result = await updateAnime(message.positionalArgs.identifier.toString(), 'all', message.locale)
    } catch (e) {
      await sendErrorEmbed(message, 'command.animeupdate.err.fail')
      console.log(e)
    }
  },
  afterExecute: async (message) => {
    const stateMessage = message.customData.stateMessage as NormalMessage

    if (!message.customData.result) {
      await stateMessage.delete()  
      await message.reactions.removeAll()
      await message.addReaction('1077894898331697162')
      safeSendMessage(message, 'command.animeupdate.err.fail')
      return
    }


    const animeID = message.customData.result.anime

    if (!animeID) {
      safeSendMessage(message, 'command.animeupdate.err.failToFetch')
      return
    }

    const { data: response } = await axios.get(`/anime/${animeID}`, {
      baseURL: Deno.env.get('ANIMA_API')
    }) as { data: { data: Anima.RAW.Anime } }
    const anime = response.data

    try {
      const animeEmbed = new app.Embed()
      if (isSupportedImage(anime.background)) {
        animeEmbed.setImage(anime.background)
      } else {
        animeEmbed.setThumbnail(anime.cover)
      }
      await stateMessage.edit({
        embeds: [
          animeEmbed
            .setAuthor(getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(anime, message.locale)?.title || 'Missing Title', 'https://emoji.discadia.com/emojis/209cd994-3a93-4812-8b6e-be6d8d07708f.GIF')
            .setDescription(`\`\`\`${getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(anime, message.locale)?.synopsis || 'Missing Synopsis'}\`\`\``)
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.categories'),
              value: `\`\`\`${anime.Category?.map( cat => getLocaleMetadata<Anima.RAW.Category, Anima.RAW.CategoryMetadata>(cat, message.locale)?.title || cat.slug ).join(', ')}\`\`\``
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.episodes'),
              value: `\`\`\`${(Number(message?.customData?.result?.finishedTasks || 0) + Number(message?.customData?.result?.failedTasks || 0)).toString()}\`\`\``,
              inline: true
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.succeededEpisodes'),
              value: `\`\`\`${(Number(message?.customData?.result?.finishedTasks || 0)).toString()}\`\`\``,
              inline: true
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.failedEpisodes'),
              value: `\`\`\`${(Number(message?.customData?.result?.failedTasks || 0)).toString()}\`\`\``,
              inline: true
            })
            .setFooter(`${message.author.username}`, message.author.avatarURL())
        ]
      })
    } catch (e) {
      sendErrorEmbed(message, 'command.animeupdate.err.fail')
      console.log(e)
    }

  }
})
