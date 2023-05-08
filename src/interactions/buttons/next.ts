import { harmony } from '@/deps.ts'
import { add_to_state, get_from_state } from '@/app/client.ts'
import { paginate } from '@/app/event.ts'

export default async (interaction: harmony.Interaction) => {
  if (interaction.message) {
    const embeds = get_from_state<string[]>('pagination')?.map((url) =>
      new harmony.Embed({ image: { url } })
    )!
    const current = get_from_state<number>('pagination_first')!

    await interaction.respond({
      type: 'UPDATE_MESSAGE',
    })

    add_to_state('pagination_first')(
      await paginate('next')(current)(interaction.message)(embeds),
    )
  }
}
