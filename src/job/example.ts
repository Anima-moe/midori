import * as app from '@/app.ts'

const cron: app.cronjob.CustomCronjob = {
  name: 'Example',
  description: 'Example cronjob',
  cron: '*/5 * * * * *',
  manual: true,
  execute: (_client, _this) => {
    console.log('Example cronjob')
  },
}

export default cron
