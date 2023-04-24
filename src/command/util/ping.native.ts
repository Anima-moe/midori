import { Command } from '@/app/command.ts'
import { dayjs, harmony, t } from '@/deps.ts'

const Ping = new Command({
  name: 'ping',
  description: 'Pong!',
  aliases: ['latency'],
  coolDown: 1000 * 4,
  execute: async (message) => {
    const embed = new harmony.Embed()
      .setColor(Deno.env.get('EMBED_COLOR') || '#57FF9A')
      .setDescription(t(message.locale, 'command.ping.reply', { latency: message.client.gateway.ping, processing: dayjs(dayjs().unix() - dayjs(message.timestamp).unix()).millisecond() }))
      
    await message.channel.send(embed)
    await message.triggerCoolDown()
  },
})

export default Ping
