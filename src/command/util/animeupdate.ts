import { CustomCommand } from '@/app/command.ts'

export default new CustomCommand({
  name: 'animeupdate',
  aliases: ['au', 'aniupdate', 'aniupdt'],
  description: 'command.animeupdate.description',
  usage: 'command.animeupdate.usage',
  beforeExecute: async (_message) => {
  },
  execute: async (message) => {
    await message.send('')
  },
})
