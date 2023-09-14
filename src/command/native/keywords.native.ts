import * as app from '@/app.ts'
import Keyword from '@/model/keywords.ts'
import { sendErrorEmbed, sendSuccessEmbed } from '@/namespace/utils.native.ts'

const KeywordManager = new app.command.CustomCommand({
  name: 'keywordmanager',
  description: 'command.keyword.description',
  longDescription: 'command.keyword.longDescription',
  usage: '-a add -k "hello world" -r "Hello to you too!"',
  aliases: ['keyword', 'keywords', 'kw', 'kwm'],
  category: 'category.native',
  guildOwnerOnly: true,
  args: [
    {
      name: 'action',
      flag: 'a',
      required: true,
      description: 'command.keyword.args.action',
      validate: (value) => ['add', 'remove', 'list'].includes(value),
    },
    {
      name: 'keyword',
      flag: 'k',
      description: 'command.keyword.args.keyword',
      required: false,
    },
    {
      name: 'response',
      flag: 'r',
      description: 'command.keyword.args.response',
      required: false,
    },
    {
      name: 'locale',
      flag: 'l',
      description: 'command.keyword.args.locale',
      required: false,
      default: 'pt-BR',
    },
  ],
  beforeExecute: async (message) => {
    message.customData = {
      tips: [],
      registeredKeywords: [],
    }

    if (
      message.args.action === 'add' &&
      (!message.args.keyword || !message.args.response)
    ) {
      throw new Error('generic.err.command.missingArgument')
    }

    if (message.args.action === 'remove' && !message.args.keyword) {
      throw new Error('generic.err.command.missingArgument')
    }

    if (
      message.args.action === 'list' &&
      (message.args.keyword || message.args.response)
    ) {
      const embed = new app.Embed()
        .setColor('#f5b342')
        .setDescription('\u200b')
        .setDescription(
          app.t(message.locale, 'command.keyword.tips.noResponseOnList'),
        )
      message.customData.tips.push(embed)
    }

    if (message.args.action === 'remove' && message.args.response) {
      const embed = new app.Embed()
        .setColor('#f5b342')
        .setDescription(app.t(message.locale, 'command.keyword.tips.noArgsOnList'))
      message.customData.tips.push(embed)
    }

    const tableResolvable = app.database.models.get('keyword')
    if (!tableResolvable) throw new Error('Table not found')

    const availableKeywords = await app.orm.findMany(tableResolvable, {})

    message.customData.registeredKeywords = availableKeywords
  },
  execute: async (message) => {
    switch (message.args.action) {
      case 'add': {
        const keyword = message.args.keyword as string
        const response = message.args.response as string

        const { registeredKeywords } = message.customData as {
          registeredKeywords: Keyword[]
        }

        if (registeredKeywords.find((kw: Keyword) => kw.locale_serverId_keyword.split('<<LOCALE_KEYWORD>>')[1].split('$$keyword$$')[1] === keyword)) {
          await sendErrorEmbed(
            message,
            'command.keyword.errors.keywordAlreadyRegistered',
          )
          return
        }

        const tableResolvable = app.database.models.get('keyword')
        if (!tableResolvable) throw new Error('Table not found')

        const keywordModel = new Keyword()
        keywordModel.locale_serverId_keyword = `${message.args.locale || 'pt-BR'}<<LOCALE_KEYWORD>>${message.guild!.id}$$keyword$$${keyword}`
        keywordModel.response = response
        app.orm.save(keywordModel)

        await sendSuccessEmbed(message, 'command.keyword.add.succ', {
          keyword: message.args.keyword,
        })

        app.cache.getCache('keyword')?.set('keywordList', [])

        break
      }
      case 'remove': {
        const tableResolvable = app.database.models.get('keyword')
        if (!tableResolvable) throw new Error('Table not found')
        const arg = message.args.keyword as string

        app.orm.delete(tableResolvable, {
          where: {
            clause: 'locale_serverId_keyword = ?',
            values: [`${message.args.locale}<<LOCALE_KEYWORD>>${message.guild!.id}$$keyword$$${arg}`],
          },
        })

        await sendSuccessEmbed(message, 'command.keyword.remove.succ', {
          keyword: message.args.keyword,
        })
        break
      }
      case 'list': {
        const { registeredKeywords } = message.customData as {
          registeredKeywords: Keyword[]
        }

        const embed = new app.Embed()
          .setColor(Deno.env.get('EMBED_COLOR') || '#57FF9A')
          .setTitle(app.t(message.locale, 'command.keyword.list.title'))

        if (registeredKeywords.length > 0) {
          registeredKeywords.forEach((keyword: Keyword) => {
            const kw = keyword.locale_serverId_keyword.split('<<LOCALE_KEYWORD>>')[1].split('$$keyword$$')[1]
            const kwLocale = keyword.locale_serverId_keyword.split('<<LOCALE_KEYWORD>>')[0]

            embed.addField(
              app.t(message.locale, 'command.keyword.generic.keyword'),
              `\`\`\`${kw}\`\`\``,
              true,
            )
            embed.addField(
              app.t(message.locale, 'command.keyword.generic.response'),
              `${keyword.response}`,
              true,
            )
            embed.addField(
              app.t(message.locale, 'command.keyword.generic.locale'),
              `\`\`\`${kwLocale}\`\`\``,
              true,
            )
          })
        } else {
          embed.setDescription(
            app.t(message.locale, 'command.keyword.err.noKeywords'),
          )
        }

        await message.reply({ embeds: [...message.customData.tips, embed] })

        break
      }
    }
  },
})

export default KeywordManager
