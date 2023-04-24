import { crayon, harmony, orm, SqlTable } from '@/deps.ts'
import { Handler } from './core/handler.ts'
import Logger from './core/logger.ts'
import { resolve } from 'std/path'

const logger = new Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as any || 'debug',
  prefix: 'DB',
})

const handler = new Handler('src/model')

handler.on('load', async (filePath) => {
  const table = await import('file://' + resolve(filePath))
  const tableBreadcrumb = filePath.split('\\').slice(2).join(' > ')
  const tableFileName = filePath.split('\\').slice(-1)[0].replace('.ts', '')

  try {
    if (!table.default) {
      throw new Error(`No default export found in ${tableBreadcrumb}`)
    }

    const instance = new table.default()

    models.add(instance)

    logger.success(
      `Loaded ${
        tableFileName.includes('.native') ? crayon.green('native ') : ''
      }table "${crayon.lightCyan(instance.constructor.name)}"`,
    )
  } catch (e) {
    logger.error(e.message)
    return
  }
})

export const models =
  new (class Table extends harmony.Collection<string, SqlTable> {
    public add(table: SqlTable) {
      this.set(table.constructor.name, table)
    }

    public resolve(name: string) {
      return this.find((table) => table.constructor.name === name)
    }
  })()

export default handler
