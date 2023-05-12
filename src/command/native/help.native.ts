import * as app from '@/app.ts'
import { sendPaginatedEmbed } from '@/namespace/utils.native.ts'
import { splitArray } from '@/namespace/utils.ts'

export default new app.command.CustomCommand({
  name: 'help',
  description: 'command.help.menu.description',
  aliases: ['h', 'a', 'ajuda', '?'],
  category: 'category.native',
  beforeExecute: (message) => {
    const commands = app.command.collection

    message.customData = {
      commands,
    }
  },
  execute: async (message) => {
    const registeredCommands = message.customData.commands as Map<string, app.command.CustomCommand<'guild'>['options']>
    const categories: { [key: string]: app.command.CustomCommand<'guild'>['options'][] } = {}

    registeredCommands.forEach((command) => {
      const category = command.category ?? 'category.undefined'

      if (!categories[category]) {
        categories[category] = [command]
      } else {
        categories[category].push(command)
      }
    })

    const helpEmbeds: app.Embed[] = []
    const commands: app.command.CustomCommand<'guild'>['options'][] = []

    Object.keys(categories).forEach((category) => {
      const categoryCommands = categories[category]

      categoryCommands.forEach((command) => {
        commands.push(command)
      })
    })

    const commandsChunks = splitArray<app.command.CustomCommand<'guild'>['options']>(commands)

    commandsChunks.forEach((chunk) => {
      const commandsEmbed = new app.Embed()
        .setDescription(app.t(message.locale, 'command.help.menu.content', { prefix: app.client.prefix as string }))
        .setColor(Deno.env.get('EMBED_COLOR') || '#36393f')
        .setAuthor({
          name: app.t(message.locale, 'command.help.menu.title'),
          icon_url: 'https://em-content.zobj.net/thumbs/120/microsoft/319/package_1f4e6.png',
        })

      chunk.sort().forEach((command) => {
        commandsEmbed.addField({
          name: ` `,
          value: `\`\`\`ansi
[30m┌[0m[41m[1m  ${app.client.prefix}${command.name}  [0m[30m  @  ${
            app.t(message.locale, `${command.category || 'category.undefined'}`)
          }[0m
[30m├[32m ${app.t(message.locale, command.description)}[0m
[30m│
[30m├[30m [31m${app.t(message.locale, 'command.help.aliases')}[0m
[30m└[30m${app.client.prefix}[32m${command.aliases?.join(`[30m, ${app.client.prefix}[32m`) || '--'}[0m

\`\`\`
`,
        })
      })

      helpEmbeds.push(commandsEmbed)
    })
    try {
      await sendPaginatedEmbed(message, helpEmbeds.sort(), {
        previousButtonStyle: 'PRIMARY',
        nextButtonStyle: 'PRIMARY',
      })
    } catch (e) {
      console.error(e)
    }
  },
})
