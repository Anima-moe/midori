import * as app from '@/app.ts'

const logger = new app.Logger({
  logLevel: Deno.env.get('BOT_LOG_LEVEL') as any || 'info',
  prefix: 'EventReady',
})

export default {
  description: 'Executes tasks when the bot is ready',
  execute: () => {
    logger.info('Bot is ready!')
  },
}
