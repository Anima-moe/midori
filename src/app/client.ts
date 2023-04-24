import { harmony } from '@/deps.ts'

// Start bot.
export const client = new harmony.CommandClient({
  prefix: Deno.env.get('BOT_PREFIX') || '!',
})

export function getClient() {
  if (client.user?.id) return client
  else throw new Error('Client is not ready yet')
}
