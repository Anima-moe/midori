import { harmony } from '@/deps.ts'

export const _internalState: Map<string, unknown> = new Map()
export const addToState = (key: string) => (value: unknown) =>
  _internalState.set(key, value)
export const getFromState = <T>(key: string) =>
  _internalState.get(key) as T | undefined

// Start bot.
export const client = new harmony.CommandClient({
  prefix: Deno.env.get('BOT_PREFIX') || '!',
})

export function getClient() {
  if (client.user?.id) return client
  else throw new Error('Client is not ready yet')
}
