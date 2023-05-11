import Logger from '@/app/core/logger.ts'
import * as app from '@/app.ts'

import { orm, stringSimilarity } from '@/deps.ts'
import { isNormalMessage, safeSendMessage } from '@/namespace/utils.native.ts'

import Keyword from '@/model/keywords.ts'

const logger = new Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as any || 'debug',
  prefix: 'MsgHandler',
})

const keywordCache = app.cache.ensure<Keyword[]>('keyword', 1000 * 60 * 10) // keyword cache clears every 10 minutes.
keywordCache.set('keywordList', [])

const event: app.event.Listener<'messageCreate'> = {
  description: 'Handles messages and executes automatic actions',
  once: false,
  execute: (message) => {
    if (!isNormalMessage(message)) return
    if (message.content.startsWith(app.client.prefix.toString())) return

    try {
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

        let threshold = 0.6
        const messageContent = message.content.split(' ')

        if (messageContent.length > 6) {
          threshold = 0.35
        }

        if (messageContent.length > 10) {
          threshold = 0.30
        }

        if (messageContent.length > 15) {
          return
        }

        if (!keywordTest) continue
        const similarity = stringSimilarity.compareTwoStrings(
          message.content.toLowerCase(),
          keywordTest.toLowerCase(),
        )

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
