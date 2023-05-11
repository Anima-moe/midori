import { harmony } from '../src/deps.ts'

export interface EventMaker {
  description: string
  once?: boolean
  execute: (...args: any) => void
}

interface ExtendedClientEvents {
  'messageCreate': [harmony.Message & NormalMessage]
  'interactionCreate': [harmony.Interaction & { message: harmony.Message & { locale: string } }]
}

export type NormalMessage = harmony.Message & {
  customData: any
  args: { [name: string]: string | number }
  positionalArgs: { [key: string]: string | number }
  triggerCoolDown: () => void
  send: (
    this: NormalMessage,
    sent: string | harmony.AllMessageOptions,
  ) => Promise<harmony.Message>
  isFromBotOwner: boolean
  isFromGuildOwner: boolean
  client: harmony.Client
  /**
   * Locale key for translation
   *
   * This value is set based on the author roles prefixed by `lang:` ex: American English role would be `lang:en-US`
   * @default .env BOT_LOCALE
   */
  locale: string
}