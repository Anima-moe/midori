import { NormalMessage } from '../src/app/command.ts'
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
