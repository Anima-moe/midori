import { dayjs, harmony } from "@/deps.ts"
import { ensureCache } from '@/app/cache.ts'

export type interactionHandler = (interaction: harmony.Interaction) => Promise<void>

export const interactionHandlers = ensureCache<interactionHandler>('interactionHandler', 1000 * 60 * 60 * 24)

export const coolDownCache = ensureCache<dayjs.Dayjs>('cooldown', Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30))

export const globalCoolDownCache = ensureCache<dayjs.Dayjs>('globalCooldown', Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30))