import * as app from '@/app.ts'
import { sendErrorEmbed, sendSuccessEmbed } from '../../namespace/utils.native.ts'

export default new app.command.CustomCommand({
  name: 'clear',
  aliases: ['clear', 'cls'],
  description: 'command.clear.description',
  usage: 'command.clear.usage',
  category: 'category.utility',
  positionalArgs: [
    {
      name: 'amount',
      description: 'command.clear.args.amount',
      required: true,
    },
  ],
  execute: async (message) => {
    const channel = message.channel as app.GuildTextChannel

    if (channel.type !== 0) {
      return
    }

    const amount = Number(message.positionalArgs['amount'])

    if (isNaN(amount) || amount + 1 > 100 || amount < 1) {
      await message.reactions.removeAll()
      await sendErrorEmbed(message, 'command.clear.err.invalidAmount')
      await message.addReaction(':bot_fail:1077894898331697162')
      return
    }

    try {
      await channel.bulkDelete(Number(amount) + 1)
      await sendSuccessEmbed(message, 'command.clear.success', { amount: amount + 1 })
    } catch (e) {
      console.log(e)
      message.send({
        embeds: [
          new app.Embed()
            .setColor('RED')
            .setDescription(app.t(message.locale, 'command.clear.err.unknown'))
            .setImage('https://media.tenor.com/FJsjk_9b_XgAAAAC/anime-hit.gif'),
        ],
      })
    }
  },
})
