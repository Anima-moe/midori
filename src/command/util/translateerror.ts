import { CustomCommand } from "@/app/command.ts";
import * as app from '@/app.ts'
import { sendErrorEmbed } from "@/namespace/utils.native.ts";

export default new CustomCommand({
  name: 'translateerror',
  description: 'command.translateerror.description',
  aliases: ['te', 'decode', 'geterr'],
  allowedRoles: ['staff', 'mod', 'helping hand', 'code contributor'],
  beforeExecute: async (message) => {
    const referenceMessageID = message?.messageReference?.message_id
    if (!referenceMessageID) {
      await message.reply('command.translateerror.error.noMessageReference')
      return
    }

    const referenceMessage = await message.channel.messages.fetch(referenceMessageID)

    if (!referenceMessage) {
      await sendErrorEmbed(message, 'command.translateerror.error.noMessageReference')
      return
    }

    const referenceMessageContent = await referenceMessage.content

    if (!referenceMessageContent.startsWith('.err')) {
      await sendErrorEmbed(message, 'command.translateerror.error.referenceMessageNotError')
      return
    }

    message.customData = {
      b64: referenceMessageContent.split(' ')[1],
    }

  },
  
  execute: async (message) => {
    const referenceMessage = message.customData.b64

    if (!referenceMessage) {
      return
    }

    const embed = new app.Embed()
    .setColor('#2b2d31')

    const decoded = atob(referenceMessage)
    const parsed = JSON.parse(decoded)

    Object.entries(parsed).map(([key, value]) => {
      embed.addField(key, `\`\`\`${value as string}\`\`\``, true)
    })

    if (parsed.animeID || parsed.animeId) {
      try {
        const animeOnAnima = await fetch(`https://api.anima.moe/anime/${parsed.animeID || parsed.animeId}`)
        const animeOnAnimaJSON = await animeOnAnima.json()
  
        embed.setThumbnail(animeOnAnimaJSON.data.cover)
        const animeTitle = animeOnAnimaJSON.data.AnimeMetadata.find( (a: { locale_key: string }) => a.locale_key === message.locale)?.title || 'Anime not found / not translated'
        embed.setTitle(animeTitle)
      } catch {
        embed.setTitle('Anime not found / not translated')
      }
    }
  
    await message.reply(embed)
  },
  

})