import { resolve } from 'std/path'
import { Handler } from '@/app/core/handler.ts'
import { crayon, harmony } from '@/deps.ts'
import { Server } from 'std/http'
import Logger from './core/logger.ts'

const logger = new Logger({
  prefix: 'Webhook',
  logLevel: 'debug',
})

export interface WebhookContext<T> extends Request {
  data: T
  params: { [key: string]: string }
}

export function extractParamsFromPath(path: string): Record<string, string> {
  const url = new URL(`http://dummy.com${path}`)
  const params: Record<string, string> = {}

  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }

  return params
}

export interface CustomWebhook<T extends WebhookContext<T>> {
  /**
   * Route/Path to trigger the webhook
   * @example 
   * path: '/hello'
   * // results in: http://<IP>:<port>/hook/hello
  *
  */
 path: string
 /**
 * A brief description of the webhook
 */
 description: string
  /**
  *  Method called when the webhook is triggered
  */
  execute: (requestData: T) => Response | Promise<Response>
}

export const handler = new Handler('src/hook', { logger: (m) => logger.debug(m) })

handler.on('load', async (filePath) => {
  const hook = await import('file://' + resolve(filePath))
  const hookBreadcrumb = filePath.split('\\').slice(2).join(' > ')

  if (!hook.default) {
    logger.error(
      `The webhook file ${hookBreadcrumb} needs to export CustomWebhook instance as default`,
    )
    return
  }

  try {

    logger.success(
      `Loaded hook "${crayon.lightCyan(hook.default.name)}" - ${crayon.lightBlack(hook.default.description)}`,
    )
  } catch (e) {
    logger.error(`Error while loading cronjob ${hookBreadcrumb}`)
    console.error(e)
    return
  }
})

handler.on('finish', async () => {
  const handler = async (req: Request) => {
    const requestURL = req.url
    
    if (!requestURL.startsWith('/hook/')) {
      return new Response(JSON.stringify({ message: 'Not Found'}), { status: 404 })
    }
    
    const requestPath = new URL(requestURL).pathname.replace('hook/', '')
    const requestParams = extractParamsFromPath(requestURL)

    const hook = hooks.resolve(requestPath)

    if (!hook) {
      return new Response(JSON.stringify({ message: 'Not Found'}), { status: 404 })
    }

    try {
      return hook.execute({
        ...req,
        params: requestParams,
        data: await req.json()
      })
    } catch (e) {
      logger.error(`Error while executing webhook ${hook.path}`)
      console.error(e)
      return new Response('Internal server error', { status: 500 })
    }
  }

  const server = new Server({ port: Number(Deno.env.get('WEBHOOK_PORT')!), handler })
  logger.success(`Webhook server listening on port ${Deno.env.get('WEBHOOK_PORT')}`)
  await server.listenAndServe()
})

export const hooks = new (class HookCollection extends harmony.Collection<string, CustomWebhook<any>> {
  public validate(hook: CustomWebhook<any>) {
    if (!hook.path) throw new Error('Webhook path is required')
    if (!hook.path.startsWith('/')) throw new Error('Webhook path must start with "/"')
    if (!hook.execute) throw new Error('Webhook execute is required')
  }

  public resolve(path: string) {
    return this.find((hook) => hook.path === path)
  }

  public add(hook: CustomWebhook<any>) {
    this.validate(hook)
    this.set(hook.path, hook)
  }
})()

// export const jobs = new (class CronjobCollection extends harmony.Collection<string, CustomWebhook & { croner: Cron }> {
//   public validate(job: CustomWebhook) {
//     if (!job.name) throw new Error('Cronjob name is required')
//     if (!job.cron) throw new Error('Cronjob cron is required')
//     if (!job.execute) throw new Error('Cronjob execute is required')
//   }

//   public resolve(name: string) {
//     return this.find((job) => job.name === name)
//   }

//   public add(job: CustomWebhook) {
//     this.validate(job)
//     const cron = new Cron(job.cron, {
//       timezone: job.timezone,
//       name: job.name,
//       catch: job.onError,
//       maxRuns: job.maxRuns,
//       unref: true,
//       paused: job.manual,
//     }, job.execute.bind(this, client))
//     this.set(job.name, { ...job, croner: cron })
//   }

//   public start(client: harmony.Client) {
//     this.forEach((job) => {
//       if (job.immediate) {
//         job.execute.bind(this, client)(job)
//       }

//       logger.info(
//         `Starting job "${crayon.lightCyan(job.name)}" - ${crayon.lightBlack(job.cron)}`,
//       )
//     })
//   }
// })()
