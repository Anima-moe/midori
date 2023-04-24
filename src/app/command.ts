import Logger from '@/app/core/logger.ts'
import { Handler } from '@/app/core/handler.ts'
import { crayon, harmony } from '@/deps.ts'
import { resolve } from 'https://deno.land/std@0.176.0/path/win32.ts'

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

export type NormalMessage = harmony.Message & {
  customData: any
  args: { [name: string]: string | number } & (string[] | number[])
  positionalArgs: string[]
  triggerCoolDown: () => void
  send: (
    this: NormalMessage,
    sent: string | harmony.AllMessageOptions,
  ) => Promise<harmony.Message>
  isFromBotOwner: boolean
  isFromGuildOwner: boolean
  client: harmony.Client
  /**
   * Locale key for translation
   *
   * This value is set based on the author roles prefixed by `lang:` ex: American English role would be `lang:en-US`
   * @default .env BOT_LOCALE
   */
  locale: string
}

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

export interface CommandOptions<T extends keyof CommandMessageType> {
  /**
   * Command name & trigger
   */
  name: string
  /**
   * Brief description of what the command does
   */
  description: string
  /**
   * Longer description shown when the command is used with the help flag
   */
  longDescription?: string
  /**
   * Command aliases (alternative names)
   */
  aliases?: string[]
  /**
   * Command arguments
   */
  args?: {
    name: string
    flag: string
    required?: boolean
    default?: any
    validate?: (value: any) => boolean
  }[]
  /**
   * Arguments ordered by position
   */
  positionalArgs?: {
    name: string
    required?: boolean
    validate?: (value: any) => boolean
  }[]
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
   * List of permissions required for the user to execute the command
   */
  userPermissions?:
    | (keyof typeof PermissionFlags)
    | harmony.PermissionResolvable
  /**
   * List of roles allowed to execute this command (does not override userPermissions)
   */
  requiredRoles?: string[]
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
   * Function that will be executed when the command is triggered
   */
  execute: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
  ) => Promise<void>

  /**
   * Function that will be executed after the command is executed
   * @param message - the message that triggered the command
   */
  afterExecute?: (
    this: CommandMessageType[T],
    message: CommandMessageType[T],
  ) => Promise<void>

  /**
   * Function that will be executed when the command fails to execute
   * @param error - the error that was thrown
   */
  onError?: (
    error: unknown,
  ) => Promise<void> | void
}

export class Command<T extends keyof CommandMessageType = 'all'> {
  filepath?: string

  constructor(public options: CommandOptions<T>) {}
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

const handler = new Handler('src/command')

handler.on('load', async (filePath) => {
  const command = await import('file://' + resolve(filePath))
  const commandBreadcrumb = filePath.split('\\').slice(2).join(' > ')
  const commandFileName = filePath.split('\\').slice(-1)[0].replace('.ts', '')

  try {
    if (!command.default) {
      throw new Error(`File ${filePath} must export a command as default`)
    }
    logger.success(
      `Loaded ${
        commandFileName.includes('.native')
          ? crayon.green('native')
          : crayon.bgLightYellow('custom')
      } command "${crayon.lightCyan(command.default.options.name)}" - ${
        crayon.lightBlack(command.default.options.description)
      }`,
    )
    commands.add(command.default)
  } catch (e) {
    logger.error(`Error while loading command ${commandBreadcrumb}`)
    console.error(e)
    return
  }
})

export function validateCommand<
  T extends keyof CommandMessageType = keyof CommandMessageType,
>(
  command: Command<T>,
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
    command.options?.coolDown && !command.toString().includes('triggerCoolDown')
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

export const commands = new (class CommandCollection extends harmony.Collection<
  string,
  CommandOptions<keyof CommandMessageType>
> {
  public resolve(key: string): Command<keyof CommandMessageType> | undefined {
    for (const [name, commandOptions] of this) {
      if (key === name || commandOptions.aliases?.includes(key)) {
        return new Command(commandOptions)
      }
    }
  }

  public add(command: Command<keyof CommandMessageType>) {
    validateCommand(command)
    this.set(command.options.name, command.options)
  }
})()

export default handler
