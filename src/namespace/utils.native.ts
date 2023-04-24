import { harmony } from '@/deps.ts'
import { CommandOptions } from '../app/command.ts'

export function isNormalMessage(
  message: harmony.Message,
) {
  return (
    !!message.channel &&
    !!message.author &&
    !message.author.bot &&
    !message.webhookID
  )
}

export function isGuildMessage(
  message: harmony.Message,
) {
  return (
    !!message.member &&
    !!message.guild &&
    message.channel instanceof harmony.GuildChannel
  )
}

export function isPrivateMessage(
  message: harmony.Message,
) {
  return (
    message.channel instanceof harmony.DMChannel
  )
}

export function resolveArgument(
  args: { [key: string]: string | number },
  optionArg: CommandOptions<any>['args'],
) {
  const resolvedArgs: { [key: string]: string | number } = {}
  console.log(args, optionArg)
  optionArg?.forEach((arg) => {
    if (args[arg.flag]) {
      resolvedArgs[arg.name] = args[arg.flag]
    } else if (args[arg.name]) {
      resolvedArgs[arg.name] = args[arg.name]
    } else if (!resolvedArgs[arg.name] && arg.default) {
      resolvedArgs[arg.name] = arg.default
    } else if (!resolvedArgs[arg.name] && arg.required) {
      throw new Error(`error.command.missingArgument ${arg.name}`)
    }
  })

  return resolvedArgs
}

export function resolvePositionalArgument(
  args: (string | number)[],
  optionArg: CommandOptions<any>['positionalArgs'],
) {
  if (!optionArg) return {}

  const resolvedArgs: { [key: string]: string | number } = {}

  if (optionArg.length > args.length) {
    throw new Error(
      `error.command.missingPositionalArgument ${optionArg![args.length].name}`,
    )
  }

  optionArg?.forEach((arg, index) => {
    if (args[index]) {
      resolvedArgs[arg.name] = args[index]
    }
  })

  return resolvedArgs
}

export async function resolveEmoji(message: harmony.Message, emoji: string) {
  if (emoji.match(/<a?:\w+:\d+>/)) {
    const emojiId = emoji.match(/\d+/)?.[0]
    if (!emojiId) return emoji

    const solvedEmoji = await message.guild?.emojis.resolve(emojiId)
    if (!solvedEmoji) return emoji

    return solvedEmoji
  }

  return emoji
}
