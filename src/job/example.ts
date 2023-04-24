import { CustomCronjob } from '@/app/cronjob.ts'

const cron: CustomCronjob = {
  name: 'Example',
  description: 'Example cronjob',
  cron: '*/5 * * * * *',
  execute: (_client , _this) => {
    console.log('Example cronjob')
  }
}

export default cron