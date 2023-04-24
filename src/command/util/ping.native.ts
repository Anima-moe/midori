import { Command } from '@/app/command.ts'
import { t } from "@/deps.ts";

const Ping = new Command({
  name: 'ping',
  description: 'Pong!',
  aliases: ['latency'],
  coolDown: 1000 * 4,
  execute: async (message) => {
    await message.send(t(message.locale, 'command.ping.pong', { latency: message.client.gateway.ping }))

    message.triggerCoolDown()
  },
})

export default Ping
