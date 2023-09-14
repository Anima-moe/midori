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
  
    // @ts-ignore - bulkDelete is not in the typings
    if (channel.type !== 0) {
      return
    }

    let amount = Number(message.positionalArgs['amount'])
    
    if (message.positionalArgs['amount'] === 'all') {
      amount = 99
    }

    if (isNaN(amount) || amount + 1 > 100 || amount < 1) {
      await message.reactions.removeAll()
      await sendErrorEmbed(message, 'command.clear.err.invalidAmount')
      await message.addReaction('⛔')
      return
    }

    try {
      // @ts-ignore - bulkDelete is not in the typings
      await channel.bulkDelete(Number(amount) + 1)
      const statusMessage = await sendSuccessEmbed(message, 'command.clear.success', { amount: amount + 1 })
      setTimeout(()=>{
        statusMessage.delete()
        .catch(() => {})
      }, 3000)
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
