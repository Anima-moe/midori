import { Command } from '@/app/command.ts'
import { add_to_state } from '@/app/client.ts'
import { harmony } from '../../deps.ts'

const TestCommand = new Command({
  name: 'test',
  description: 'ahigfhaiosoifa',
  longDescription: 'ahsidhausda',
  usage: 'alshdlioaskdlalksd',
  aliases: ['test', 't'],
  execute: async (message) => {
    add_to_state('pagination')([
      'https://github.com/kkuriboh.png',
      'https://github.com/nodgear.png',
    ])
    add_to_state('pagination_first')(0)

    await message.reply({
      embeds: [
        new harmony.Embed({
          image: { url: 'https://github.com/kkuriboh.png' },
        }),
      ],
      components: [{
        type: 'ACTION_ROW',
        components: [
          {
            type: 'BUTTON',
            style: 'RED',
            customID: 'prev',
            label: 'previous',
          },
          {
            type: 'BUTTON',
            style: 'GREEN',
            customID: 'next',
            label: 'next',
          },
        ],
      }],
    })
  },
})

export default TestCommand
