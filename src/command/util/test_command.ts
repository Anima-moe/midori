import { Command } from '@/app/command.ts'
import { harmony } from '../../deps.ts'
import { sendPaginatedEmbed } from '../../namespace/utils.native.ts'

const TestCommand = new Command({
  name: 'test',
  description: 'ahigfhaiosoifa',
  longDescription: 'ahsidhausda',
  usage: 'alshdlioaskdlalksd',
  aliases: ['test', 't'],
  execute: async (message) => {
    await sendPaginatedEmbed(message, [
      new harmony.Embed().setTitle('Teste').setDescription('Teste2'),
      new harmony.Embed().setTitle('Teste3').setDescription('Teste4'),
    ])
  }    
})

export default TestCommand
