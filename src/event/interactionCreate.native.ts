import type { Listener } from '@/app/event.ts'
import { interactionHandlers } from '../namespace/states.native.ts'
import { t } from '@/deps.ts'
import { client } from '@/app/client.ts'
import * as app from '@/app.ts'

const event: Listener<'interactionCreate'> = {
  description: 'Listens for interactions with native components (like pagination)',
  execute: async (interaction) => {
    const message = interaction.message

    if (!message) return

    try {
      const guildChannel = message?.channel as app.GuildTextChannel
      const guildID = guildChannel?.guildID
      const guild = await client.guilds.get(guildID)
      const guildMember = await guild?.members.get(interaction.user.id)

      const userLocale = (await guildMember?.roles.array())?.find((role) => role.name.startsWith('lang:'))?.name
        .replace('lang:', '')

      userLocale && (message.locale = userLocale)
    } catch {
      message.locale = Deno.env.get('BOT_DEFAULT_LOCALE') || 'en-US'
    }

    const interaction_id = (interaction.data as any).custom_id as
      | string
      | undefined

    if (interaction_id) {
      const interactionHandler = await interactionHandlers.get(interaction_id)

      if (interactionHandler) {
        await interactionHandler(interaction)
      } else {
        console.log('interaction not found', interaction_id)
        await interaction.reply({
          ephemeral: true,
          content: t(
            interaction.message.locale,
            'generic.err.interaction.notFound',
          ),
        })
      }
    }
  },
}

export default event
