import { dayjs, harmony } from "@/deps.ts"
import { ensureCache } from '@/app/cache.ts'

export type interactionHandler = (interaction: harmony.Interaction) => Promise<void>

export const interactionHandlers = ensureCache<interactionHandler>('interactionHandler', 1000 * 60 * 60 * 24)

export const coolDownCache = ensureCache<dayjs.Dayjs>('cooldown', Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30))

export const globalCoolDownCache = ensureCache<dayjs.Dayjs>('globalCooldown', Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30))

export const paginateEmbed =
  (by: 'next' | 'previous') =>
  (curr: number) =>
  (message: harmony.Message) =>
  async (embeds: harmony.Embed[]): Promise<number> => {
    if (message.embeds.length === 0) {
      await message.edit({ embeds: [embeds[0]] })
      return 0
    }

    const indicator = by === 'next' ? 1 : -1
    const getNextEmbed =
      (arr: harmony.Embed[]) => (val: harmony.Embed): harmony.Embed => {
        for (let index = 0; index < arr.length; index++) {
          if (arr[index] === val) {
            return by === 'next'
              ? arr[index + indicator] || arr[0]
              : arr[index + indicator] || arr[arr.length - 1]
          }
        }

        return arr[0]
      }

    await message.edit({
      embeds: [
        getNextEmbed(embeds)(embeds[curr]),
      ],
    })

    return curr === embeds.length - 1
      ? 0
      : curr === 0
      ? embeds.length - 1
      : curr + indicator
  }
