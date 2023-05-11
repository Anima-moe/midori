import { crayon, harmony, SqlTable } from '@/deps.ts'
import { Handler } from './core/handler.ts'
import Logger from './core/logger.ts'
import { resolve } from 'std/path'

const logger = new Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as any || 'debug',
  prefix: 'DB',
})

export const handler = new Handler('src/model')

handler.on('load', async (filePath) => {
  const table = await import('file://' + resolve(filePath)) as {
    default: new () => SqlTable
    identifier: string
  }
  const tableBreadcrumb = filePath.split('\\').slice(2).join(' > ')
  const tableFileName = filePath.split('\\').slice(-1)[0].replace('.ts', '')

  try {
    if (!table.default) {
      throw new Error(`No default export found in ${tableBreadcrumb}`)
    }

    if (!table.identifier) {
      throw new Error(
        `No identifier found in ${tableBreadcrumb}, export identifier const with table name`,
      )
    }

    models.add(table.identifier, table.default)

    logger.success(
      `Loaded ${
        tableFileName.includes('.native') ? crayon.green('native ') : ''
      }table "${crayon.lightCyan(table.identifier)}"`,
    )
  } catch (e) {
    logger.error(e.message)
    return
  }
})

export const models =
  new (class Table extends harmony.Collection<string, new () => SqlTable> {
    public add(identifier: string, table: new () => SqlTable) {
      this.set(identifier, table)
    }
  })()

