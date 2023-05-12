import * as app from '@/app.ts'
import { Cron, scheduledJobs } from "@/deps.ts";

import { getLocaleMetadata } from '@/namespace/anime.ts'
import { sendPaginatedEmbed, sendSuccessEmbed } from '@/namespace/utils.native.ts'
import { updateAnime } from "@/namespace/cli.ts";
import { splitArray } from '@/namespace/utils.ts';

import Schedule from '@/model/schedules.ts'

import axios from 'npm:axios'
import construe from 'https://esm.sh/cronstrue/i18n'

import { Anima } from '../../../@types/anima.d.ts'

export default new app.command.CustomCommand({
  name: 'animeschedule',
  aliases: ['anischedule', 'anicron', 'asch', 'anischedule', 'amicron'],
  description: 'command.animeschedule.description',
  longDescription: 'command.animeschedule.longDescription',
  usage: 'command.animeschedule.usage',
  category: 'category.anima',
  args: [
    {
      name: 'action',
      flag: 'a',
      description: 'command.animeschedule.args.action',
    },
    {
      name: 'id',
      flag: 'i',
      description: 'command.animeschedule.args.id',
      validate: (value) => {
        if (isNaN(Number(value))) {
          return false
        }

        return true
      }
    },
    {
      name: 'cron',
      flag: 'c',
      description: 'command.animeschedule.args.cron',
    },
  ],
  allowedRoles: ['staff', 'mod'],
  beforeExecute: async (message) => {
    message.customData = {}
    const eventsModel = app.database.models.get('schedule')
    if (!eventsModel) { return }

    const events = await app.orm.findMany(eventsModel, {})

    message.customData.events = events
  },
  execute: async (message) => {
    const previousEvents = message.customData.events as Schedule[]

    const localeLookup = {
      'pt-BR': 'pt_BR',
      'en-US': 'en'
    }

    // User provided no arguments
    // Show all schedules
    if (!message.args['action']) {

      const embedList: app.Embed[] = []
      
      const splitEvents = splitArray<{ cronjob: string, animeID: string }>(message.customData.events)
      
      const waitMessage = await sendSuccessEmbed(message, app.t(message.locale, 'command.animeschedule.success.fetching'))

      for (const events of splitEvents) {
        
        const embed = new app.Embed()
        .setAuthor(message.author.username, message.author.avatarURL())

        for (const event of events) {
          const { data: animeResponse } = await axios.get<Anima.API.GetAnimeByID>(`${Deno.env.get('ANIMA_API')}/anime/${event.animeID}`)
  
          if (!animeResponse) { return }
          embed.addField(`${getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(animeResponse.data, message.locale)?.title || 'No title'} [${animeResponse.data.id}]`, `\`\`\`ansi\n[30m${event.cronjob}\n[0m${construe.toString(event.cronjob, { locale: localeLookup[message.locale as 'pt-BR' | 'en-US']})}\`\`\``)
        }

        embedList.push(embed)
      }

      await sendPaginatedEmbed(message, embedList, {
        nextButtonStyle: 'PRIMARY',
        previousButtonStyle: 'PRIMARY',
      })
      
      await waitMessage?.delete?.()
    }


    // User wants to add a new anime to schedule.
    if (message.args['action'] === 'add') {
      if (!message.args['cron'] || !message.args['id']) {
        throw new Error(app.t(message.locale, 'generic.err.command.missingArgument', { command: 'animeschedule' }))
      }
      
      if (previousEvents.find((event) => event.animeID === Number(message.args['id']))) {
        throw new Error(app.t(message.locale, 'command.animeschedule.err.alreadyScheduled', { anime: message.args['id'] }))
      }
      const scheduleModel = new Schedule()

      const animeID = Number(message.args['id'])
      const cron = message.args['cron'] as string

      const animaAnime = await axios.get<Anima.API.GetAnimeByID>(`${Deno.env.get('ANIMA_API')}/anime/${animeID}`)
      if (!animaAnime.data) { throw new Error('command.animeschedule.err.invalidAnimeID') }

      const animaAnimeMetadata = getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(animaAnime.data.data, message.locale)
      
      scheduleModel.animeID = animeID
      scheduleModel.cronjob = cron
      
      await app.orm.save(scheduleModel)

      new Cron(
        cron,
        {
          catch: () => {
            console.error(`Failed to execute task ${animeID}`)
          },
          timezone: 'America/Sao_Paulo',
          name: `anime-${animeID}`,
        },
        () => {
          console.info(`Updating anime ${animeID}`)          
          updateAnime(animeID.toString(), 'episode')
        }
      )
      
      await sendSuccessEmbed(message, 'command.animeschedule.success.added', { 
        anime: animaAnimeMetadata?.title || 'No title', 
        cron: construe.toString(cron, { locale: localeLookup[message.locale as 'pt-BR' | 'en-US']}), 
        rawCron: cron 
      })

    }

    // use wants to remove an anime from schedule
    if (message.args['action'] === 'remove') {
      if (!message.args['id']) {
        throw new Error(app.t(message.locale, 'generic.err.command.missingArgument', { command: 'animeschedule' }))
      }

      if (!previousEvents.find((event) => event.animeID === Number(message.args['id']))) {
        throw new Error(app.t(message.locale, 'command.animeschedule.err.notScheduled', { anime: message.args['id'] }))
      }

      const scheduleModel = app.database.models.get('schedule')
      if (!scheduleModel) { return }
      
      await app.orm.delete(
        scheduleModel, 
        { 
          where: {
            clause: 'animeID = ?',
            values: [Number(message.args['id'])]
          } 
        }
      )

      scheduledJobs.find( cron => cron.name === `anime-${message.args['id']}`)?.stop()

      await sendSuccessEmbed(message, 'command.animeschedule.success.removed', { anime: message.args['id'], cron: message.args['cron'] })
    }
  }
})