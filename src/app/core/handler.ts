import { BaseEventNames, EventEmitter } from '@/app/core/listener.ts'
import * as path from 'std/path'

export interface HandlerEvents extends BaseEventNames {
  load: [path: string]
  finish: [pathList: string[]]
}

export interface HandlerOptions<Element> {
  logger?: (message: string) => void
  /**
   * Use $path to replace by file path <br>
   * Use $basename to replace by file name <br>
   * Use $filename to replace by file name without extension <br>
   * @example ```ts
   * const handler = new Handler("./commands", {
   *   loggerPattern: "$filename loaded"
   *   logger: console
   * })
   * ```
   */
  loggerPattern?: string
  loader?: (path: string) => Promise<Element>
}

export class Handler<Element> extends EventEmitter<HandlerEvents> {
  public elements: Map<string, Element> = new Map()

  constructor(private path: string, private options?: HandlerOptions<Element>) {
    super()
  }

  async init() {
    this.elements.clear()

    const filepathList: string[] = []

    for await (const dirEntry of Deno.readDir(this.path)) {
      if (dirEntry.isDirectory) {
        const subHandler = new Handler(path.join(this.path, dirEntry.name), {
          loader: this.options?.loader,
          logger: this.options?.logger,
          loggerPattern: this.options?.loggerPattern,
        })

        subHandler.on('load', (filePath) => {
          this.emit('load', filePath)
        })

        subHandler.on('finish', (subCommandFileList) => {
          filepathList.push(...subCommandFileList)
        })

        await subHandler.init()
        continue
      }

      const filepath = path.join(this.path, dirEntry.name)
      const filename = path.basename(filepath, path.extname(filepath))

      filepathList.push(filepath)

      if (this.options?.logger) {
        this.options.logger(
          this.options.loggerPattern
            ? this.options.loggerPattern
              .replace('$path', filepath)
              .replace('$basename', dirEntry.name)
              .replace('$filename', filename)
            : `loaded ${filename}`,
        )
      }

      if (this.options?.loader) {
        this.elements.set(filepath, await this.options.loader(filepath))
      }

      await this.emit('load', filepath)
    }
    await this.emit('finish', filepathList)
  }
}
