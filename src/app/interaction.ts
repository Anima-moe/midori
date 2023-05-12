import { resolve } from 'std/path'
import Logger from '@/app/core/logger.ts'
import { Handler } from '@/app/core/handler.ts'
import { crayon, harmony } from '@/deps.ts'

const logger = new Logger({
  prefix: 'Interact',
  logLevel: 'debug',
})

export interface CustomInteraction {
  name: string
  description: string
  id: string
  execute: (interaction: harmony.Interaction & { message: { locale: string } }) => Promise<void>
}

export const handler = new Handler('src/interactions')

handler.on('load', async (filePath) => {
  const interaction = await import('file://' + resolve(filePath))
  const interactionBreadcrumb = filePath.split('\\').slice(2).join(' > ')

  if (!interaction.default) {
    logger.error(
      `The interaction file ${interactionBreadcrumb} needs to export CustomInteraction instance as default`,
    )
    return
  }

  try {
    collection.add(interaction.default)
    logger.success(
      `Loaded interaction "${crayon.lightCyan(interaction.default.name)}" - ${
        crayon.lightBlack(interaction.default.description)
      }`,
    )
  } catch (e) {
    logger.error(`Error while loading interaction ${interactionBreadcrumb}`)
    console.error(e)
    return
  }
})

export const collection = new (class CronjobCollection extends harmony.Collection<string, CustomInteraction> {
  public validate(interaction: CustomInteraction) {
    if (!interaction.name) throw new Error('Interaction name is required')
    if (!interaction.id) throw new Error('Interaction uniqueID is required')
    if (!interaction.description) throw new Error('Interaction name is required')
    if (!interaction.execute) throw new Error('Interaction execute is required')
  }

  public resolve(id: string) {
    return this.find((interaction) => interaction.id === id)
  }

  public add(interaction: CustomInteraction) {
    this.validate(interaction)

    this.set(interaction.id, { ...interaction })
  }
})()
