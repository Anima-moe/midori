import Logger from '@/app/core/logger.ts'
import { client } from '@/app/client.ts'
import { EventListener } from '@/app/event.ts'
import { ensureCache } from '@/app/cache.ts'

import { stringSimilarity, harmony, t, orm } from '@/deps.ts'
import {
  isNormalMessage,
  safeAddReaction,
  safeRemoveReactions,
  safeSendMessage,
sendErrorEmbed
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

    try{
      // TEST FOR KEYWORD MATCH/SIMILARITY
      // if similarity is above 0.5, send the keyword response
      if (keywordCache.get('keywordList')?.length === 0) {
        const keywordList = orm.findMany(Keyword, {})
        keywordCache.set('keywordList', keywordList)
      }
  
      const keywordList = keywordCache.get('keywordList')
      let highestSimilarity: string
      for (const keyword of keywordList || []) {
        const keywordTest = keyword.keyword.split('<<LOCALE_KEYWORD>>')[1]
  
        let threshold = 0.5
  
        if (message.content.split(' ').length > 5) {
          threshold = 0.3
        }
  
        if (message.content.split(' ').length > 10) {
          threshold = 0.4
        }
  
        if (!keywordTest) continue
        const similarity = stringSimilarity.compareTwoStrings(message.content.toLowerCase(), keywordTest.toLowerCase())
  
        if (similarity > threshold) {
          highestSimilarity = keyword.response
        }
      }
  
      if (highestSimilarity!) {
        safeSendMessage(message, highestSimilarity)
      }
    } catch (e) {
      return logger.error(`${e}`)
    }
  },
}

export default event
