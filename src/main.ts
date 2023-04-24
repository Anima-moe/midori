import 'https://deno.land/x/dotenv@v3.2.2/load.ts'

import commandHandler from '@/app/command.ts'
import cronjobHandler from '@/app/cronjob.ts'
import eventHandler from '@/app/event.ts'

import { client } from '@/app/client.ts'

import { harmony } from '@/deps.ts'

// Load modules.
await commandHandler.init()
await cronjobHandler.init()
await eventHandler.init()

await client.connect(
  Deno.env.get('BOT_TOKEN'),
  harmony.Intents.All,
)
