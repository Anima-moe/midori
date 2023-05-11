import { dayjs } from '@/deps.ts'
import * as app from '@/app.ts'

export type interactionHandler = (interaction: app.Interaction) => Promise<void>

export const interactionHandlers = app.cache.ensure<interactionHandler>(
  'interactionHandler',
  1000 * 60 * 60 * 24,
)

export const coolDownCache = app.cache.ensure<dayjs.Dayjs>(
  'cooldown',
  Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30),
)

export const globalCoolDownCache = app.cache.ensure<dayjs.Dayjs>(
  'globalCooldown',
  Number(Deno.env.get('MAX_COOLDOWN') || 1000 * 60 * 30),
)

export const paginateEmbed =
  (by: 'next' | 'previous') =>
  (curr: number) =>
  (message: app.Message) =>
  async (embeds: app.Embed[]): Promise<number> => {
    if (message.embeds.length === 0) {
      await message.edit({ embeds: [embeds[0]] })
      return 0
    }

    const indicator = by === 'next' ? 1 : -1
    const getNextEmbed = (arr: app.Embed[]) => (val: app.Embed): app.Embed => {
      for (let index = 0; index < arr.length; index++) {
        if (arr[index] === val) {
          return by === 'next' ? arr[index + indicator] || arr[0] : arr[index + indicator] || arr[arr.length - 1]
        }
      }

      return arr[0]
    }

    await message.edit({
      embeds: [
        getNextEmbed(embeds)(embeds[curr]),
      ],
    })

    return curr === embeds.length - 1 ? 0 : curr === 0 ? embeds.length - 1 : curr + indicator
  }
