import Logger from '@/app/core/logger.ts'

import * as app from '@/app.ts'

import { argParser, crayon, dayjs, t } from '@/deps.ts'
import {
  isNormalMessage,
  resolveArgument,
  resolvePositionalArgument,
  safeAddReaction,
  safeRemoveReaction,
  safeRemoveReactions,
  sendErrorEmbed,
  sendSuccessEmbed,
} from '@/namespace/utils.native.ts'
import { coolDownCache, globalCoolDownCache } from '@/namespace/states.native.ts'
import { NormalMessage } from '../../@types/event.d.ts'

const logger = new Logger({
  logLevel: Deno.env.get('LOG_LEVEL') as any || 'debug',
  prefix: 'CmdHandler',
})

function resolveRoleCoolDown(
  roles?: string[],
  options?: app.command.Options<'all'>,
) {
  if (!roles) return options?.globalCoolDown || options?.coolDown || 0
  if (!options?.roleCoolDown) {
    return options?.globalCoolDown || options?.coolDown || 0
  }

  let smallestCoolDown: number = options?.globalCoolDown || options?.coolDown ||
    0

  for (const roleCD of options.roleCoolDown) {
    if (roles.includes(roleCD.role.toLowerCase())) {
      if (smallestCoolDown > roleCD.coolDown) {
        smallestCoolDown = roleCD.coolDown
      }
    }
  }

  return smallestCoolDown
}

const event: app.event.Listener<'messageCreate'> = {
  description: 'Manage message commands',
  once: false,
  execute: async (message) => {
    if (!isNormalMessage(message)) return

    const isSelfMention = new RegExp(`<@!?${message.client?.user?.id}>$`).test(
      message.content,
    )
    const prefix = app.client.prefix.toString()

    if (!message.content.startsWith(prefix) && !isSelfMention) return

    const key = message.content.split(/\s+/)[0].slice(prefix.length)
    const cmd: app.command.CustomCommand<any> | undefined = app.command
      .collection.resolve(key)

    message.isFromBotOwner = message.author.id === Deno.env.get('BOT_OWNER')
    message.isFromGuildOwner = message?.guild?.ownerID === message.author.id
    message.args = {}
    message.positionalArgs = {}

    // Discord sometimes reports 404 on stuff out of cache, meaning some of those functions might throw an error. Welcome to the try catch hell.
    try {
      message.send = async function (
        this: NormalMessage,
        sent: string | app.AllMessageOptions,
      ) {
        return await this.channel.send(sent)
      }.bind(message)

      if (cmd?.options.botOwnerOnly && !message.isFromBotOwner) {
        return await sendErrorEmbed(message, 'generic.err.command.botOwnerOnly')
      }

      if (cmd?.options.guildOwnerOnly && !message.isFromGuildOwner && !message.isFromBotOwner) {
        return await sendErrorEmbed(message, 'generic.err.command.guildOwnerOnly')
      }

      message.locale = ((await message?.member?.roles.array())?.find((role) =>
        role.name.startsWith('lang:')
      )?.name.replace('lang:', '')) || Deno.env.get('BOT_DEFAULT_LOCALE') ||
        'en-US'

      if (isSelfMention) {
        return await sendSuccessEmbed(message, 'generic.mention', { prefix })
      }
    } catch (e) {
      logger.error(
        `Internal Error while handling command ${crayon.lightCyan('messageCreate.native')} extra properties`,
      )
      logger.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(message, 'generic.err.command.unknown')
    }

    if (!cmd) return

    message.triggerCoolDown = async () => {
      if (cmd.options.globalCoolDown) {
        globalCoolDownCache.set(
          `${cmd.options.name}`,
          dayjs.unix(cmd.options.globalCoolDown),
        )
      }

      if (cmd.options.coolDown) {
        coolDownCache.set(
          `${message.author.id}.${cmd.options.name}`,
          dayjs().add(cmd.options.coolDown, 'milliseconds'),
        )
      }

      if (cmd.options.roleCoolDown) {
        const userRoles = (await message?.member?.roles.array())?.map(
          (role) => role.name.toLowerCase(),
        )
        const roleCD = resolveRoleCoolDown(userRoles, cmd.options)
        coolDownCache.set(
          `${message.author.id}.${cmd.options.name}`,
          dayjs().add(roleCD, 'milliseconds'),
        )
      }
    }

    // Check if the user has all needed permissions
    try {
      if (cmd.options.requiredPermissions) {
        const hasPermissions = cmd.options.requiredPermissions.every((perm) => {
          return message.member?.permissions.has(perm)
        }) || message.isFromBotOwner

        if (!hasPermissions) {
          return await sendErrorEmbed(message, 'command.error.noPermissions')
        }
      }
    } catch (e) {
      logger.error(
        `Error while handling command ${crayon.lightCyan('messageCreate.native')} permissions`,
      )
      console.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(message, 'generic.err.command.unknown')
    }

    // check if the user has any of the needed roles
    try {
      if (cmd.options?.allowedRoles) {
        const userRoles = await message.member?.roles.array()
        const hasRoles = cmd.options.allowedRoles.some((role) =>
          userRoles?.some((r) =>
            r.name.toLowerCase() === role.toLocaleLowerCase()
          )
        ) || message.isFromBotOwner

        if (!hasRoles) {
          return await sendErrorEmbed(message, 'command.error.noRoles')
        }
      }
    } catch (e) {
      logger.error(
        `Error while handling command ${crayon.lightCyan('messageCreate.native')} roles`,
      )
      console.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(message, 'generic.err.command.unknown')
    }

    const cleanContent = message.content.slice(prefix.length + key.length)
      .trim()

    // Check & insert argumentos into message object.
    try {
      const parsedArgs = argParser(cleanContent)

      if (parsedArgs.help || parsedArgs.h) {
        const helpEmbed = new app.Embed()
          .setColor('#2b2d31')
          .addField(
            t(message.locale, 'command.help.name'),
            `\`\`\`${cmd.options.name}\`\`\``,
          )
          .addField(
            t(message.locale, 'command.help.description'),
            `\`\`\`${
              t(
                message.locale,
                cmd.options.longDescription || cmd.options.description ||
                  '--',
              )
            }\`\`\``,
          )
          .addField(
            t(message.locale, 'command.help.arguments'),
            `\`\`\`ahk\n${
              [...cmd.options.args || [], {
                flag: 'h',
                name: 'help',
                description: t(
                  message.locale,
                  'command.help.defaultArgument',
                ),
              }]
                ?.map((arg) => {
                  return `\n-${arg.flag} --${arg.name}${arg.required ? ':' : ''} \n;${
                    t(message.locale, arg.description || '')
                  }`
                })
                .join('\n') || '--'
            }\`\`\``,
          )
        if (
          cmd.options.positionalArgs && cmd.options.positionalArgs?.length > 0
        ) {
          helpEmbed
            .addField(
              t(message.locale, 'command.help.positionalArguments'),
              '\`\`\`ahk\n' + cmd.options.positionalArgs?.map((arg) => {
                return `\n${arg.required ? `<${arg.name}>:` : `[${arg.name}]` + ` ;${arg.description}`}`
              }) + '\`\`\`',
            )
        }

        helpEmbed
          .addField(
            '🪴 ' + t(message.locale, 'command.help.aliases'),
            `\`\`\`${cmd.options.aliases?.join(', ')}\`\`\``,
            true,
          )
          .addField(
            '⏳ ' + t(message.locale, 'command.help.cooldown'),
            `\`\`\`ahk
@Everyone: ${cmd.options.coolDown ? dayjs.duration(cmd.options.coolDown * 1000).asMinutes() + 'min' : '--'}${
              cmd.options?.roleCoolDown
                ? '\n' +
                  cmd.options.roleCoolDown.map((role) =>
                    `@${role.role}: ${dayjs.duration(role.coolDown * 1000).asMinutes()}min`
                  ).join('\n')
                : ''
            }
            \`\`\``,
            true,
          )
          .addField(
            '🛡️ ' + t(message.locale, 'command.help.usage'),
            `\`\`\`${prefix}${cmd.options.name} ${t(message.locale, cmd.options.usage || '')}\`\`\``,
          )
          .addField(
            '🔑 ' + t(message.locale, 'command.help.permissions'),
            `\`\`\`${
              cmd.options.botOwnerOnly
                ? t(message.locale, 'generic.botOwner')
              : cmd.options.guildOwnerOnly
                ? t(message.locale, 'generic.guildOwner')
              : cmd.options.requiredPermissions?.map((perm) => t(message.locale, `permission.${perm}`)).join(', ') ||
                  '--'
            }\`\`\``,
            true,
          )
          .addField(
            '🔑 ' + t(message.locale, 'command.help.roles'),
            `\`\`\`${
              cmd.options.botOwnerOnly
                ? 'Developer'
                : cmd.options.allowedRoles?.map((role) => role.charAt(0).toUpperCase() + role.slice(1)).join(', ') ||
                  '--'
            }\`\`\``,
            true,
          )

        return message.send({ embeds: [helpEmbed] })
      }

      const positionalObject = resolvePositionalArgument(
        parsedArgs._,
        cmd.options.positionalArgs,
      )
      const argsObject = resolveArgument(parsedArgs, cmd.options.args)

      parsedArgs._.forEach((arg: string, index: number) => {
        const cmdPositionals = cmd.options.positionalArgs
        const reference = cmdPositionals?.[index]

        if (reference) {
          positionalObject[reference.name] = arg

          if (typeof reference.validate === 'function') {
            const validation = reference.validate(arg)

            if (!validation) {
              throw new Error('generic.err.command.invalidArgument')
            }
          }
        }
      })

      message.positionalArgs = positionalObject
      message.args = argsObject
    } catch (e) {
      logger.error(
        `Error while handling command ${crayon.lightCyan('messageCreate.native')} arguments`,
      )
      logger.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(
        message,
        t(message.locale, e.message, {
          command: `${prefix}${cmd.options.name}`,
        }),
      )
    }

    // Check & asserts command cooldown
    try {
      if (
        (cmd.options.coolDown || cmd.options.roleCoolDown) &&
        !message.isFromBotOwner
      ) {
        const coolDown = coolDownCache.get(`${message.author.id}.${cmd.options.name}`) ||
          globalCoolDownCache.get(`${cmd.options.name}`)
        const userRoles = (await message?.member?.roles.array())?.map(
          (role) => role.name.toLowerCase(),
        )

        if (
          coolDown &&
          (
            coolDown?.unix() > dayjs()?.unix() ||
            coolDown?.unix() >
              dayjs()?.add(
                resolveRoleCoolDown(userRoles, cmd.options),
                'milliseconds',
              )?.unix()
          )
        ) {
          throw new Error(`error.command.coolDown`)
        }
      }
    } catch (e) {
      logger.error(
        `Error while handling command ${crayon.lightCyan('messageCreate.native')} cooldown`,
      )
      logger.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(message, 'generic.err.command.coolDown')
    }

    await safeAddReaction(message, '🔃')

    try {
      await cmd.options?.beforeExecute?.bind(cmd)(message)
      cmd.options.execute.bind(cmd)(message)
        ?.then(async () => {
          try {
            await safeRemoveReaction(message, '🔃')
            await safeAddReaction(message, '🥳')
            await cmd.options.afterExecute?.bind(cmd)(message)
          } catch(e) {
            logger.error(`Fatal error: ${e}`)
          }
        })
        ?.catch(async (e) => {
          logger.error(
            `Error while handling command ${crayon.lightCyan('messageCreate.native')} bindedExecution`,
          )
          logger.error(e)
          await safeRemoveReactions(message)
          await safeAddReaction(message, '⛔')
          await sendErrorEmbed(
            message,
            t(message.locale, e.message, {
              command: `${prefix}${cmd.options.name}`,
            }),
          )
          await cmd.options.onError?.bind(cmd)(message, e)
        })
    } catch (e) {
      logger.error(
        `Error while handling command ${crayon.lightCyan('messageCreate.native')} beforeExecution`,
      )
      logger.error(e)
      await safeRemoveReactions(message)
      await safeAddReaction(message, '⛔')
      return await sendErrorEmbed(
        message,
        t(message.locale, e.message, {
          command: `${prefix}${cmd.options.name}`,
        }),
      )
    }
  },
}

export default event
