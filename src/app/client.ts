import { harmony } from '@/deps.ts'

export const INTERNAL_STATE: Map<string, unknown> = new Map()
export const addToClientState = (key: string) => (value: unknown) =>
  INTERNAL_STATE.set(key, value)
export const getFromClientState = <T>(key: string) =>
  INTERNAL_STATE.get(key) as T | undefined

// Start bot.
export const client = new harmony.CommandClient({
  prefix: Deno.env.get('BOT_PREFIX') || '!',
})

export function getClient() {
  if (client.user?.id) return client
  else throw new Error('Client is not ready yet')
}
