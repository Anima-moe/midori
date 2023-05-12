import * as app from '@/app.ts'
import { updateAnime } from '@/namespace/cli.ts'
import axios from 'npm:axios'
import { isSupportedImage, sendErrorEmbed, sendSuccessEmbed } from '@/namespace/utils.native.ts'
import { Anima } from '../../../@types/anima.d.ts'
import { getLocaleMetadata } from '@/namespace/anime.ts'
import { NormalMessage } from '../../../@types/event.d.ts'

const errorCache = app.cache.ensure('errorreport', 1000 * 60 * 10)

export default new app.command.CustomCommand({
  name: 'reporterror',
  aliases: ['err', 'errmeta', 'errep'],
  description: 'command.reportError.description',
  usage: 'command.reportError.usage',
  category: 'category.anima',
  positionalArgs: [
    {
      name: 'error',
      description: 'command.reportError.args.error',
      required: true,
    },
  ],
  // Nonregistered users: 60 minutes
  coolDown: 60 * 60,
  // registered users: 10 minutes
  roleCoolDown: [
    {
      coolDown: 60 * 10,
      role: 'anima user',
    },
    {
      coolDown: 0,
      role: 'staff',
    },
    {
      coolDown: 60 * 2,
      role: 'mod',
    },
  ],
  beforeExecute: async (message) => {
    message.customData = {}

    const error = message.positionalArgs['error'] as string

    if (!error) {
      await message.reactions.removeAll()
      await message.addReaction('<:bot_fail:1077894898331697162>')
      await sendErrorEmbed(message, 'command.reporterror.err.noError')
      throw new Error('command.reportError.err.noError')
    }

    const errorObject = JSON.parse(atob(error))

    if (errorCache.has(errorObject.animeId)) {
      throw new Error('command.reportError.err.alreadyReported')
    }

    const errorType = message.content.split(' ')[0]?.replace('.', '')

    try {
      const animeResponse = await axios.get<Anima.API.GetAnimeByID>(
        `https://api.anima.moe/anime/${errorObject.animeId}`,
      )
      const anime = animeResponse.data.data
      message.customData.statusMessage = await sendSuccessEmbed(message, 'command.reportError.state.start', {
        anime: getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(anime, message.locale)?.title || 'Unknown',
      })
    } catch (_e) {
      message.customData.statusMessage?.delete?.()
      throw new Error('command.reportError.err.invalidAnime')
    }

    message.customData.error = errorObject
    message.customData.errorType = errorType
  },
  execute: async (message) => {
    const errorObject = message.customData.error
    const errorType = message.customData.errorType as 'errmeta' | 'err' | 'errep'

    // The error code is missing or invalid, midori can't do antyhing but tag a staff.
    // We decode the error to make staff life's easier.
    if (!errorObject.error_type || !errorObject.animeId) {
      throw new Error('command.reportError.err.invalidError')
    }

    const errorLookup = {
      'errmeta': 'metadata',
      'err': 'all',
      'errep': 'episode',
    }

    const stateMessage = message.customData.statusMessage as NormalMessage

    try {
      message.customData.result = await updateAnime(
        errorObject.animeId,
        errorLookup[errorType || 'all'],
        message.locale,
      )

      const animeResponse = await axios.get<Anima.API.GetAnimeByID>(
        `https://api.anima.moe/anime/${errorObject.animeId}`,
      )
      const anime = animeResponse.data.data

      const animeMetadata = getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(anime, message.locale)
      const animeEmbed = new app.Embed()
      if (anime.background && isSupportedImage(anime.background)) {
        animeEmbed.setImage(anime.background)
      } else {
        animeEmbed.setThumbnail(anime.cover)
      }
      await stateMessage.edit({
        embeds: [
          animeEmbed
            .setAuthor(animeMetadata?.title || 'Missing Title')
            .setDescription(
              `\`\`\`${
                getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(anime, message.locale)?.synopsis ||
                'Missing Synopsis'
              }\`\`\``,
            )
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.categories'),
              value: `\`\`\`${
                anime.Category?.map((cat) =>
                  getLocaleMetadata<Anima.RAW.Category, Anima.RAW.CategoryMetadata>(cat, message.locale)?.title ||
                  cat.slug
                ).join(', ')
              }\`\`\``,
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.episodes'),
              value: `\`\`\`${
                (Number(message?.customData?.result?.finishedTasks || 0) +
                  Number(message?.customData?.result?.failedTasks || 0)).toString()
              }\`\`\``,
              inline: true,
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.succeededEpisodes'),
              value: `\`\`\`${(Number(message?.customData?.result?.finishedTasks || 0)).toString()}\`\`\``,
              inline: true,
            })
            .addField({
              name: app.t(message.locale, 'command.animeupdate.embed.failedEpisodes'),
              value: `\`\`\`${(Number(message?.customData?.result?.failedTasks || 0)).toString()}\`\`\``,
              inline: true,
            })
            .setFooter(`${message.author.username}`, message.author.avatarURL()),
        ],
      })
    } catch (e) {
      await sendErrorEmbed(message, 'command.animeupdate.err.fail')
      stateMessage?.delete?.()
      console.log(e)
    }
  },
  afterExecute: (message) => {
    errorCache.set(message.customData.error.animeId, true, 1000 * 60 * 10)
  },
})
