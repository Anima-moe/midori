import { crayon, dayjs } from '@/deps.ts'
const { columns } = Deno.consoleSize()
import { stripColor } from 'https://deno.land/std@0.184.0/fmt/colors.ts'
import { unicodeWidth } from 'std/console'

const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 4,
}

interface LoggerOptions {
  writeToFile: boolean
  prefix: string
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'success'
}

export default class Logger {
  public options: LoggerOptions = {
    writeToFile: false,
    prefix: 'Logger',
    logLevel: 'debug',
  }

  constructor(options: Partial<LoggerOptions>) {
    this.options = {
      writeToFile: options.writeToFile || false,
      prefix: options.prefix || 'Logger',
      logLevel: options.logLevel || 'debug',
    }

    if (this.options.writeToFile) {
      Deno.mkdirSync('./logs')
    }
  }

  private _parseMessage(message: any) {
    if (message instanceof Error) {
      return message.stack
    }
    
    if (Array.isArray(message)) {
      return JSON.stringify(
        {
          count: message.length,
          items: JSON.stringify(message, null, 2),
        },
        null,
        2,
      )
    }
    if (typeof message === 'object') {
      return JSON.stringify(message, null, 2)
    }

    return message
  }

  private _stamp() {
    return crayon.lightBlack(` ${dayjs().format('HH:mm:ss')} `)
  }

  private _prefix(level = 0) {
    const stampSize = unicodeWidth(stripColor(this.options.prefix + ' > '))
    const stampMaxSize = 10
    const padding = stampMaxSize - stampSize
    const spaces = padding > 0 ? ' '.repeat(padding) : ''

    if (level === 1) {
      return crayon.cyan(this.options.prefix + spaces) +
        crayon.lightBlack(' > ')
    }
    if (level === 2) {
      return crayon.rgb(226, 135, 67)(this.options.prefix + spaces) +
        crayon.lightBlack(' > ')
    }
    if (level === 3) {
      return crayon.lightRed(this.options.prefix + spaces) +
        crayon.lightBlack(' > ')
    }
    if (level === 4) {
      return crayon.green(this.options.prefix + spaces) +
        crayon.lightBlack(' > ')
    }

    return crayon.bgLightCyan(this.options.prefix)
  }
  private _message(message: string) {
    return this._parseMessage(message)
  }

  private _output(message: string, icon: string, level: number) {
    const messageSize = unicodeWidth(stripColor(this._message(message)))
    const stampSize = unicodeWidth(stripColor(this._stamp()))
    const iconSize = unicodeWidth(stripColor(icon))
    const prefixSize = unicodeWidth(stripColor(this._prefix(level)))

    const totalSpaces = columns - messageSize - stampSize - iconSize -
      prefixSize - 2
    return this._prefix(level) + ' ' +
      this._message(message) +
      (totalSpaces > 0 ? ' '.repeat(totalSpaces) : '\n' + ' '.repeat(columns - stampSize - prefixSize)) +
      this._stamp()
  }

  public debug(message: any) {
    if (logLevels[this.options.logLevel] < 1) {
      console.log(this._output(message, '', 0))
    }
  }

  public info(message: any) {
    if (logLevels[this.options.logLevel] < 2) {
      console.log(this._output(message, '', 1))
    }
  }

  public warn(message: any) {
    if (logLevels[this.options.logLevel] < 3) {
      console.log(this._output(message, '', 2))
    }
  }

  public error(message: any) {
    if (logLevels[this.options.logLevel] < 4) {
      console.log(this._output(message, '🧨', 3))
    }
  }

  public success(message: any) {
    if (logLevels[this.options.logLevel] < 4) {
      console.log(this._output(message, '', 4))
    }
  }
}
