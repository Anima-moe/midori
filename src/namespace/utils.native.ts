import { harmony, t } from '@/deps.ts'
import { CommandOptions, NormalMessage } from '../app/command.ts'
import Logger from '../app/core/logger.ts'

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
  optionArg?.forEach((arg) => {
    if (args[arg.flag]) {
      resolvedArgs[arg.name] = args[arg.flag]
    } else if (args[arg.name]) {
      resolvedArgs[arg.name] = args[arg.name]
    } else if (!resolvedArgs[arg.name] && arg.default) {
      resolvedArgs[arg.name] = arg.default
    } else if (!resolvedArgs[arg.name] && arg.required) {
      throw new Error('generic.err.command.missingArgument')
    }

    if (resolvedArgs[arg.name] && arg.validate) {
      const validation = arg.validate(resolvedArgs[arg.name])
      if (!validation) {
        throw new Error('generic.err.command.invalidArgument')
      }
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

  optionArg?.forEach((arg, index) => {
    if (args[index]) {
      resolvedArgs[arg.name] = args[index]
    }
  })

  if (optionArg.filter((a) => a.required).length > args.length) {
    throw new Error('generic.err.command.missingPositionalArgument')
  }

  return resolvedArgs
}

export async function sendErrorEmbed(
  message: NormalMessage,
  content?: string,
  args?: { [key: string]: string | number },
) {
  const embed = await new harmony.Embed()
    .setColor('RED')
    .setDescription(
      t(message.locale, content || 'generic.err.command.unknown', args),
    )
  return await message.channel.send({ embeds: [embed] })
}

export async function sendSuccessEmbed(
  message: NormalMessage,
  content?: string,
  args?: { [key: string]: string | number },
) {
  const embed = await new harmony.Embed()
    .setColor('GREEN')
    .setDescription(
      t(message.locale, content || 'command.success.generic', args),
    )
  return await message.channel.send({ embeds: [embed] })
}

export async function safeSendMessage(
  message: NormalMessage,
  content: string,
  args?: { [key: string]: string | number },
) {
  try {
    return await message.channel.send(
      t(message.locale, content || 'generic.succ.command', args),
    )
  } catch {
    await sendErrorEmbed(message, content || 'generic.err.command.unknown')
  }
}

export async function safeRemoveReactions(
  message: NormalMessage,
) {
  try {
    await message.reactions.removeAll()
  } catch {
    return await sendErrorEmbed(message, 'generic.err.command.unknown')
  }
}

export async function safeAddReaction(
  message: NormalMessage,
  emoji: string,
) {
  try {
    await message.addReaction(emoji)
  } catch {
    return await sendErrorEmbed(message, 'generic.err.command.unknown')
  }
}
