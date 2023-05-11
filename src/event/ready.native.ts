import { crayon } from '@/deps.ts'
import * as app from '@/app.ts'

export default {
  description: 'Says hi',
  execute: () => {
    console.log(crayon.cyan(crayon.bold(`
888b     d888 d8b      888                  d8b 
8888b   d8888 Y8P      888                  Y8P 
88888b.d88888          888                      
888Y88888P888 888  .d88888  .d88b.  888d888 888 
888 Y888P 888 888 d88" 888 d88""88b 888P"   888 
888  Y8P  888 888 888  888 888  888 888     888 
888   "   888 888 Y88b 888 Y88..88P 888     888 
888       888 888  "Y88888  "Y88P"  888     888 
    `)))
    const client = app.getClient()

    console.log(
      `${
        crayon.cyan(
          `My prefix is configured to " ${crayon.yellow(crayon.bold(client.prefix.toString()))}"`,
        )
      }`,
    )
  },
}
