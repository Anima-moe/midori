import type { Listener } from '@/app/event.ts'
import { interactionHandlers } from '../namespace/states.native.ts'
import * as app from '@/app.ts'

const event: Listener<'interactionCreate'> = {
  description: 'Listens for interactions with native components (like pagination)',
  execute: async (interaction) => {
    const message = interaction.message

    if (!message) return

    try {
      const guildChannel = message?.channel as app.GuildTextChannel
      const guildID = guildChannel?.guildID
      const guild = await app.client.guilds.get(guildID)
      const guildMember = await guild?.members.get(interaction.user.id)

      const userLocale = (await guildMember?.roles.array())?.find((role) => role.name.startsWith('lang:'))?.name
        .replace('lang:', '')

      userLocale && (message.locale = userLocale)
    } catch {
      message.locale = Deno.env.get('BOT_DEFAULT_LOCALE') || 'en-US'
    }

    try {
      const interactionID = (interaction.data as any).custom_id as
        | string
        | undefined

      if (interactionID) {
        const interactionHandler = await interactionHandlers.get(interactionID)

        if (interactionHandler) {
          await interactionHandler(interaction)
        } else {
          await interaction.reply({
            ephemeral: true,
            content: app.t(
              interaction.message.locale,
              'generic.err.interaction.notFound',
            ),
          })
        }

        // Persistent interactions:
        const persistentInteraction = app.interaction.collection.resolve(interactionID)
        persistentInteraction?.execute(interaction)
      }
    } catch (e) {
      console.error(e)
    }
  },
}

export default event
