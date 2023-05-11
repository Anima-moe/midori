import type { EventListener } from '@/app/event.ts'
import { harmony } from '@/deps.ts'
import { resolve } from 'std/path'

type interaction_handler = (interaction: harmony.Interaction) => Promise<void>

const load_interactions = async (
  base_path: string,
): Promise<Map<string, interaction_handler>> => {
  const ret = new Map()
  const dir = Deno.readDir(base_path)

  for await (const entry of dir) {
    const path = base_path + '/' + entry.name

    if (entry.isDirectory) {
      (await load_interactions(path))
        .forEach((v, k) => ret.set(k, v))
      continue
    }

    const handler = await import(
      'file://' + resolve(path)
    ) as { default: (interaction: harmony.Interaction) => Promise<void> }
    ret.set(entry.name.replace('.ts', ''), handler.default)
  }

  return ret
}

const handlers = await load_interactions('src/interactions')

const event: EventListener<'interactionCreate'> = {
  description: '?',
  execute: async (interaction) => {
    const interaction_id = (interaction.data as any).custom_id as
      | string
      | undefined

    if (interaction_id) {
      const handler = handlers.get(interaction_id)
      handler && await handler(interaction)
    }
  },
}

export default event
