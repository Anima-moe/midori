import Logger from '@/app/core/logger.ts'
import { client } from '@/app/client.ts'
import { EventListener } from '@/app/event.ts'
import { ensureCache } from '@/app/cache.ts'

import { stringSimilarity, harmony, t, orm } from '@/deps.ts'
import {
  isNormalMessage,
  safeAddReaction,
  safeRemoveReactions,
  safeSendMessage
} from '@/namespace/utils.native.ts'

import Keyword from '@/model/keywords.ts'

const logger = new Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as any || 'debug',
  prefix: 'MsgHandler',
})

const keywordCache = ensureCache<Keyword[]>('keyword', 1000 * 60 * 10) // keyword cache clears every 10 minutes.
keywordCache.set('keywordList', [])

const event: EventListener<'messageCreate'> = {
  description: 'Handles messages and executes automatic actions',
  once: false,
  execute: (message) => {
    if (!isNormalMessage(message)) { return }
    if (message.content.startsWith(client.prefix.toString())) { return }

    // TEST FOR KEYWORD MATCH/SIMILARITY
    // if similarity is above 0.7, send the keyword response
    if (keywordCache.get('keywordList').length === 0) {
      const keywordList = orm.findMany(Keyword, {})
      keywordCache.set('keywordList', keywordList)
    }

    const keywordList = keywordCache.get('keywordList')
    for (const keyword of keywordList) {
      const keywordTest = keyword.keyword.split('<<LOCALE_KEYWORD>>')[1]
      if (!keywordTest) continue
      const similarity = stringSimilarity.compareTwoStrings(message.content.toLowerCase(), keywordTest.toLowerCase())
  
      if (similarity > 0.7) {
        safeSendMessage(message, keyword.response)
      }
    }
  },
}

export default event
