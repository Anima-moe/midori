import { interactionHandler, interactionHandlers, paginateEmbed } from './states.native.ts'
import * as app from '@/app.ts'
import { NormalMessage } from '../../@types/event.d.ts'

export function isNormalMessage(
  message: app.Message,
) {
  return (
    !!message.channel &&
    !!message.author &&
    !message.author.bot &&
    !message.webhookID
  )
}

export function isGuildMessage(
  message: app.Message,
) {
  return (
    !!message.member &&
    !!message.guild &&
    message.channel instanceof app.GuildChannel
  )
}

export function isPrivateMessage(
  message: app.Message,
) {
  return (
    message.channel instanceof app.DMChannel
  )
}

export function resolveArgument(
  args: { [key: string]: string | number },
  optionArg: app.command.Options<any>['args'],
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
  optionArg: app.command.Options<any>['positionalArgs'],
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
  const embed = await new app.Embed()
    .setColor('RED')
    .setDescription(
      app.t(message.locale, content || 'generic.err.command.unknown', args),
    )
  return await message.channel.send({ embeds: [embed] })
}

export async function sendSuccessEmbed(
  message: NormalMessage,
  content?: string,
  args?: { [key: string]: string | number },
) {
  const embed = await new app.Embed()
    .setColor('GREEN')
    .setDescription(
      app.t(message.locale, content || 'command.success.generic', args),
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
      app.t(message.locale, content || 'generic.succ.command', args),
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

export function generatePaginationButton(
  id: string,
  action: 'previous' | 'next',
): interactionHandler {
  return async (interaction) => {
    if (!interaction.message) {
      interactionHandlers.delete(`paginatedEmbed@${id}`)
      return
    }

    const embeds = app.getFromState<app.Embed[]>(`paginatedEmbed@${id}`)!
    const current = app.getFromState<number>(`firstPaginatedEmbed@${id}`)!

    await interaction.respond({
      type: 'UPDATE_MESSAGE',
    })

    app.addToState(`firstPaginatedEmbed@${id}`)(
      await paginateEmbed(action)(current)(interaction.message)(embeds),
    )
    return
  }
}

export async function sendPaginatedEmbed(
  message: NormalMessage,
  embeds: app.Embed[],
  options?: {
    content?: string
    previousButtonStyle?: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER'
    nextButtonStyle?: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER'
    previousButtonLabel?: string
    nextButtonLabel?: string
    previousButtonEmoji?: app.MessageComponentEmoji
    nextButtonEmoji?: app.MessageComponentEmoji
  },
) {
  app.addToState(`paginatedEmbed@${message.id}`)(embeds)
  app.addToState(`firstPaginatedEmbed@${message.id}`)(0)

  interactionHandlers.add(
    `paginatePrev@${message.id}`,
    generatePaginationButton(message.id, 'previous'),
    Number(Deno.env.get('MAX_INTERACTION_TIME') || 60) * 1000,
  )

  interactionHandlers.add(
    `paginateNext@${message.id}`,
    generatePaginationButton(message.id, 'next'),
    Number(Deno.env.get('MAX_INTERACTION_TIME') || 60) * 1000,
  )

  embeds[0]
  .setFooter('1 / ' + embeds.length)

  await message.send({
    content: options?.content ? app.t(message.locale, options.content) : undefined,
    embeds: [embeds[0]],
    components: [{
      type: 'ACTION_ROW',
      components: [
        {
          type: 'BUTTON',
          style: options?.previousButtonStyle || 'PRIMARY',
          emoji: options?.previousButtonEmoji,
          customID: `paginatePrev@${message.id}`,
          label: options?.previousButtonLabel
            ? app.t(message.locale, options.previousButtonLabel)
            : app.t(message.locale, 'pagination.previous'),
        },
        {
          type: 'BUTTON',
          style: options?.nextButtonStyle || 'PRIMARY',
          emoji: options?.nextButtonEmoji,
          customID: `paginateNext@${message.id}`,
          label: options?.nextButtonLabel
            ? app.t(message.locale, options.nextButtonLabel)
            : app.t(message.locale, 'pagination.next'),
        },
      ],
    }],
  })
}

export function isSupportedImage(path: string) {
  console.log(path)
  const supportedExtensions = ['png', 'jpg', 'jpe', 'jpeg', 'gif', 'webp']
  const extension = path.split('.').pop()
  return supportedExtensions.includes(extension!)
}