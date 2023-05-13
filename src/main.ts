import 'https://deno.land/x/dotenv@v3.2.2/load.ts'
import * as app from '@/app.ts'

const logger = new app.Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as 'info' | 'debug' | 'warn' | 'error' | 'success' || 'info',
  prefix: 'main',
})

const expectedEnv = [
  { name: 'BOT_OWNER', required: false },
  { name: 'MAX_COOLDOWN', required: false },
  { name: 'MAX_INTERACTION_TIME', required: false },
  { name: 'ENABLE_WEBHOOKS', required: false },
  { name: 'BOT_LOG_LEVEL', required: false },
  { name: 'BOT_PREFIX', required: true },
  { name: 'BOT_TOKEN', required: true },
  { name: 'ANIMA_API', required: true },
  { name: 'WEBHOOK_PORT', required: !!Deno.env.get('ENABLE_WEBHOOKS') },
  { name: 'ANIMA_LOGIN', required: !!Deno.env.get('ENABLE_WEBHOOKS') },
  { name: 'ANIMA_PASSWORD', required: !!Deno.env.get('ENABLE_WEBHOOKS') },
]

for (const env of expectedEnv) {
  let shouldAbort = false

  if (!Deno.env.get(env.name) && !env.required) {
    logger.warn(`Missing optional environment variable: ${env.name}`)
    continue
  }

  if (!Deno.env.get(env.name) && env.required) {
    logger.error(`Missing required environment variable: ${env.name}`)
    shouldAbort = true
  }

  if (shouldAbort) {
    Deno.exit(1)
  }
}

// Load modules.
await app.database.handler.init()
await app.command.handler.init()
await app.cronjob.handler.init()
await app.event.handler.init()
await app.webhook.handler.init()

await app.client.connect(
  Deno.env.get('BOT_TOKEN'),
  app.Intents.All,
)
