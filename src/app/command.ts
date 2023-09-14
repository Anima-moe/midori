import Logger from '@/app/core/logger.ts'
import { Handler } from '@/app/core/handler.ts'
import { crayon, harmony } from '@/deps.ts'
import { resolve } from 'https://deno.land/std@0.176.0/path/win32.ts'
import { Translations } from 'https://deno.land/x/t_i18n@2.1.0/mod.ts'
import ptBR from '../language/pt-BR.ts'
import { NormalMessage } from '../../@types/event.d.ts'

// https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
export const PermissionFlags = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  /** @deprecated Use MANAGE_EMOJIS_AND_STICKERS instead */
  MANAGE_EMOJIS: 1n << 30n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  /**
   * Deprecated, use USE_APPLICATION_COMMANDS instead
   * @deprecated
   */
  USE_SLASH_COMMANDS: 1n << 31n,
  // Might be removed (as PR says)
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_THREADS: 1n << 34n,
  USE_PUBLIC_THREADS: 1n << 35n,
  USE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  START_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
} as const

export type SentItem = string | harmony.MessagePayload | harmony.MessageOptions

export type GuildMessage = NormalMessage & {
  channel: harmony.TextChannel & harmony.GuildChannel
  guild: harmony.Guild
  member: harmony.Member
}

export type DirectMessage = NormalMessage & {
  channel: harmony.DMChannel
}

export interface CommandMessageType {
  guild: GuildMessage
  dm: DirectMessage
  all: NormalMessage
}

export interface Options<T extends keyof CommandMessageType> {
  /**
   * Command name & trigger
   */
  name: string
  /**
   * Brief description of what the command does
   *
   * * You can use dot notation to automatically translate this to the user's locale
   */
  description: Translations<typeof ptBR>
  /**
   * Longer description shown when the command is used with the help flag
   *
   * * You can use dot notation to automatically translate this to the user's locale
   */
  longDescription?: Translations<typeof ptBR>
  /**
   * Command aliases (alternative names)
   */
  aliases?: string[]
  /**
   * Command category, defaults to generic
   *
   * * You can use dot notation to automatically translate this to the user's locale
   *
   * @default "generic"
   */
  category?: string
  /**
   * Command arguments
   * @example
   * args: [
   * { name: 'name', flag: 'n', required: true },
   * { name: 'age', flag: 'a', validate: (value) => value > 0 }
   * ]
   * // Which ends up being used like this:
   * !command -n "John Doe" -a 20
   * // or
   * !command --name "John Doe" --age 20
   *
   * // returns in the message context object:
   * message.args.name // "John Doe"
   */
  args?: {
    name: string
    flag: string
    required?: boolean
    description?: Translations<typeof ptBR>
    default?: any
    validate?: (value: any) => boolean
  }[]
  /**
   * Arguments ordered by position
   * * If a argument is required, it must be placed before any optional argument
   * @example
   * positionalArgs: [
   *  { name: 'name', required: true },
   *  { name: 'age', validate: (value) => value > 0 }
   * ]
   *
   * // Which ends up being used like this:
   * !command "John Doe" 20
   *
   * * // returns in the message context object:
   * message.positionalArgs.name // "John Doe"
   * message.positionalArgs.age // 20
   */
  positionalArgs?: {
    name: string
    required?: boolean
    validate?: (value: any) => boolean
    description?: Translations<typeof ptBR>
  }[]
  /**
   * Instructions on how to use the command
   */
  usage?: string
  /**
   * A interval in milliseconds between each use of the command by a user
   */
  coolDown?: number
  /**
   * A interval in milliseconds between each use of the command by any user
   */
  globalCoolDown?: number
  /**
   * When true, the command will accept being executed in a DM channel
   * @default false
   */
  allowDM?: boolean
  /**
   * When true, the command will only be executed if the message was sent by a bot owner
   * @default false
   */
  botOwnerOnly?: boolean
  /**
   * When true, the command will only be executed if the message was sent by a guild owner
   */
  guildOwnerOnly?: boolean
  /**
   * List of permissions required for the user to execute the command
   */
  requiredPermissions?:
    | (keyof typeof PermissionFlags)[]
    | harmony.PermissionResolvable[]
  /**
   * List of roles allowed to execute this command (does not override requiredPermissions)
   */
  allowedRoles?: string[]
  /**
   * Function that will be executed when the command is triggered
   */
  /**
   * defines the coolDown just like coolDown, but it changes based on the user role.
   *
   * If the user has multiple roles, the role with be the lowest coolDown will be used.
   ** Does not override globalCoolDown
   ** Overrides coolDown
   ** Defaults to this.coolDown or 0
   * @argument roleArray - an array of objects with the role name and the coolDown in milliseconds
   * @example
   * roleCoolDown: [
   *  {
   *   role: 'donator',
   *   coolDown: 1000
   *  },
   *  {
   *   role: 'staff',
   *   coolDown: 0
   *  }
   * ]
   */
  roleCoolDown?: {
    role: string
    coolDown: number
  }[]

  /**
   * Runs before the `execute` function
   * * You can set `message.customData` and retrieve it on `execute`, `onError` and `afterExecute`
   */
  beforeExecute?: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
  ) => Promise<void> | void
  /**
   * Function that will be executed when the command is triggered
   */
  execute: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
  ) => Promise<void> | void

  /**
   * Function that will be executed after the command is executed
   * @param message - the message that triggered the command
   */
  afterExecute?: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
  ) => Promise<void> | void

  /**
   * Function that will be executed when the command fails to execute
   */
  onError?: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
    error: unknown,
  ) => Promise<void> | void
}

export class CustomCommand<T extends keyof CommandMessageType = 'all'> {
  filepath?: string

  constructor(public options: Options<T>) {}
}

const logger = new Logger({
  prefix: 'Command',
  logLevel: Deno.env.get('LOG_LEVEL') as
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'success' || 'debug',
})

export const handler = new Handler('src/command')

handler.on('load', async (filePath) => {
  const command = await import('file://' + resolve(filePath))
  const commandBreadcrumb = filePath.split('\\').slice(2).join(' > ')
  const commandFileName = filePath.split('\\').slice(-1)[0].replace('.ts', '')

  try {
    if (!command.default) {
      throw new Error(`File ${filePath} must export a command as default`)
    }
    logger.success(
      `Loaded ${commandFileName.includes('.native') ? crayon.green('native ') : ''}command "${
        crayon.lightCyan(command.default.options.name)
      }" - ${crayon.lightBlack(command.default.options.description)}`,
    )
    collection.add(command.default)
  } catch (e) {
    logger.error(`Error while loading command ${commandBreadcrumb}`)
    console.error(e)
    return
  }
})

export function validateCommand<
  T extends keyof CommandMessageType = keyof CommandMessageType,
>(
  command: CustomCommand<T>,
) {
  // Missing fields
  if (!command.options.name) throw new Error('Command name is required')
  if (!command.options.execute) {
    throw new Error('Command execute function is required')
  }
  if (command.options?.coolDown && !Number(command.options.coolDown)) {
    throw new Error('Command coolDown must be a number')
  }

  // CoolDown is not a number
  if (
    command.options?.globalCoolDown && !Number(command.options.globalCoolDown)
  ) {
    throw new Error('Command globalCoolDown must be a number')
  }

  // CoolDown is set, but never called.
  if (
    (
      command.options?.coolDown ||
      command.options.roleCoolDown ||
      command.options.globalCoolDown
    ) &&
    (
      !command.options.execute.toString().includes('triggerCoolDown()') &&
      !command.options.afterExecute?.toString().includes('triggerCoolDown()')
    )
  ) {
    logger.warn(
      `triggerCoolDown is never called on ${command.options.name}.execute`,
    )
  }

  // Argument has both `required` and `default` set
  if (command.options.args) {
    for (const arg of command.options.args) {
      if (arg.required && arg.default) {
        throw new Error(
          `Argument ${arg.name} has both required and default set.`,
        )
      }
    }
  }

  // Argument has last positional as required after an optional positional
  if (command.options.positionalArgs) {
    let hasOptional = false
    for (const arg of command.options.positionalArgs) {
      if (arg.required && hasOptional) {
        throw new Error(
          `Positional ${arg.name} cannot be required after an optional argument.`,
        )
      }
      if (!arg.required) hasOptional = true
    }
  }
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export const collection = new (class CommandCollection extends harmony.Collection<
  string,
  Options<keyof CommandMessageType>
> {
  public resolve(
    key: string,
  ): CustomCommand<keyof CommandMessageType> | undefined {
    for (const [name, commandOptions] of this) {
      if (key === name || commandOptions.aliases?.includes(key)) {
        return new CustomCommand(commandOptions)
      }
    }
  }

  public add(command: CustomCommand<keyof CommandMessageType>) {
    validateCommand(command)
    this.set(command.options.name, command.options)
  }
})()
