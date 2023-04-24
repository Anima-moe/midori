import { resolve } from 'std/path'
import Logger from '@/app/core/logger.ts'
import { Handler } from '@/app/core/handler.ts'
import { crayon, harmony, Cron } from '@/deps.ts'
import { client } from './client.ts'

const logger = new Logger({
  prefix: 'Cronjob',
  logLevel: 'debug',
})

export interface CustomCronjob {
  name: string
  description: string
  /**
   * Whether the cronjob should be executed immediately after loading
  */
  immediate?: boolean
  /**
   * Limits the number of times the cronjob can be executed (persists until restart)
   * 
   * If not set, the cronjob will be executed indefinitely (expected behavior)
  */
  maxRuns?: number

  onError?: (error: unknown) => void
  /**
    * Timezone in Europe/Stockholm format
  */
  timezone?: string
  /**
   * Vixie Cron format
  */
  cron: string
  execute: (client: harmony.Client, job: CustomCronjob & { croner: Cron }) => void
}

const handler = new Handler('src/job')

handler.on('load', async (filePath) => {
  const job = await import('file://' + resolve(filePath))
  const jobBreadcrumb = filePath.split('\\').slice(2).join(' > ')
  const jobFileName = filePath.split('\\').slice(-1)[0].replace('.ts', '')

  if (!job.default) {
    logger.error(`The cronjob file ${jobBreadcrumb} needs to export Cron instance as default`,)
    return
  }

  try {
    jobs.add(job.default)
    logger.success(
      `Loaded job "${crayon.lightCyan(job.default.name)}" - ${
        crayon.lightBlack(job.default.description)
      }`,
    )
  } catch (e) {
    logger.error(`Error while loading cronjob ${jobBreadcrumb}`)
    console.error(e)
    return
  }
})

handler.on('finish', () => {
  jobs.start(client)
})

export const jobs = new (class CronjobCollection extends harmony.Collection<string, CustomCronjob & { croner: Cron }> {
    public validate(job: CustomCronjob) {
      if (!job.name) throw new Error('Cronjob name is required')
      if (!job.cron) throw new Error('Cronjob cron is required')
      if (!job.execute) throw new Error('Cronjob execute is required')

    }

    public resolve(name: string) {
      return this.find((job) => job.name === name)
    }

    public add(job: CustomCronjob) {
      this.validate(job)
      const cron = new Cron(job.cron, {
        timezone: job.timezone,
        name: job.name,
        catch: job.onError,
        maxRuns: job.maxRuns,
        unref: true
      }, job.execute.bind(this, client))
      this.set(job.name, { ...job, croner: cron })
    }

    public start(client: harmony.Client) {
      this.forEach((job) => {
        if (job.immediate) {
          job.execute.bind(this, client)(job)
        }

        logger.info(
          `Starting job "${crayon.lightCyan(job.name)}" - ${crayon.lightBlack(job.cron)}`,
        )
        

      })
    }
  })()

export default handler
