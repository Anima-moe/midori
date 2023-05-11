import 'https://deno.land/x/dotenv@v3.2.2/load.ts'
import * as app from '@/app.ts'

// Load modules.
await app.database.handler.init()
await app.command.handler.init()
await app.cronjob.handler.init()
await app.event.handler.init()

await app.client.connect(
  Deno.env.get('BOT_TOKEN'),
  app.Intents.All,
)
