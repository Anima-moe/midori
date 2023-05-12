import * as app from '@/app.ts'
import { Cron } from '@/deps.ts'
import Schedule from '../model/schedules.ts'
import { updateAnime } from '../namespace/cli.ts'

const logger = new app.Logger({
  logLevel: Deno.env.get('BOT_LOG_LEVEL') as any || 'info',
  prefix: 'EventReady'
})

export default {
  description: 'Executes tasks when the bot is ready',
  execute: () => {
    const tasksModel = app.database.models.get('schedule')
    if (!tasksModel) { return }

    const registeredTasks = app.orm.findMany(tasksModel, {}) as Schedule[]

    for (const task of registeredTasks) {
      new Cron(
        task.cronjob,
        {
          catch: () => {
            logger.error(`Failed to execute task ${task.animeID}`)
          },
          timezone: 'America/Sao_Paulo',
          name: `anime-${task.animeID}`,
        },
        () => {
          logger.info(`Updating anime ${task.animeID}`)          
          updateAnime(task.animeID.toString(), 'episode')
        }
      )
      
      logger.info(`Registered new cronjob for anime ${task.animeID}`)
    }
  },
}
