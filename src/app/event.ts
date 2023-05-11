import { Handler } from '@/app/core/handler.ts'
import Logger from '@/app/core/logger.ts'
import { crayon, harmony } from '@/deps.ts'
import { client } from '@/app/client.ts'
import { basename } from 'https://deno.land/std@0.176.0/path/win32.ts'

import { resolve } from 'std/path'
import { EventMaker, ExtendedClientEvents } from '../../@types/event.d.ts'

const logger = new Logger({
  prefix: 'Event',
  logLevel: Deno.env.get('LOG_LEVEL') as
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'success' || 'debug',
})

export const handler = new Handler('src/event')

handler.on('load', async (filePath) => {
  const event = await import('file://' + resolve(filePath)) as {
    default: EventMaker
  }
  const baseName = basename(filePath)
  const clearName = (baseName.replace('.ts', '').replace(
    '.native',
    '',
  )) as keyof harmony.ClientEvents

  try {
    if (!event.default) {
      throw new Error(`File ${filePath} must export an event as default`)
    }

    logger.success(
      `Listening to ${baseName.includes('.native') && crayon.green('native ') || ''}event "${
        crayon.lightCyan(clearName)
      }" - ${crayon.lightBlack(event.default.description)}`,
    )

    try {
      validateEvent(event.default)

      if (event.default.once) {
        client.once(clearName, event.default.execute)
        return
      } else {
        client.on(clearName, event.default.execute)
        return
      }
    } catch (e) {
      logger.error(`Error while loading event ${baseName}`)
      console.error(e)
      return
    }
  } catch (e) {
    logger.error(`Error while loading event ${baseName}`)
    console.error(e)
    return
  }
})

export function validateEvent(event: EventMaker) {
  if (!event.description) throw new Error('Event must have a description')
  if (!event.execute) throw new Error('Event must have an execute function')
}
export type Listener<EventName extends keyof harmony.ClientEvents> = {
  description: string
  once?: boolean
  execute: (
    ...args:
      & harmony.ClientEvents[EventName]
      & (EventName extends 'messageCreate' ? ExtendedClientEvents['messageCreate']
        : void)
      & (EventName extends 'interactionCreate' ? ExtendedClientEvents['interactionCreate']
        : void)
  ) => void
}
