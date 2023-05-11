import { CustomCommand } from '@/app/command.ts'
import { dayjs, t } from '@/deps.ts'
import * as app from '@/app.ts'

const Ping = new CustomCommand({
  name: 'ping',
  description: 'command.ping.description',
  aliases: ['latency'],
  coolDown: 1000 * 4,
  category: 'category.native',
  execute: async (message) => {
    const embed = new app.Embed()
      .setColor(Deno.env.get('EMBED_COLOR') || '#57FF9A')
      .setDescription(
        t(message.locale, 'command.ping.reply', {
          latency: message.client.gateway.ping,
          processing: dayjs(dayjs().unix() - dayjs(message.timestamp).unix())
            .millisecond(),
        }),
      )

    await message.channel.send(embed)
  },
  afterExecute: async (message) => {
    await message.triggerCoolDown()
  },
})

export default Ping
