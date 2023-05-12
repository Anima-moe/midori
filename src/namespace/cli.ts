import { join, resolve } from 'std/path'
import { stripColor } from 'https://deno.land/std@0.185.0/fmt/colors.ts'

export async function updateAnime(identifier: string, updateType = 'episode', locale = 'pt-BR') {
  const proc = new Deno.Command(
    Deno.execPath(),
    {
      args: [
        'run',
        '--allow-read',
        '--allow-env',
        '--allow-net',
        resolve(join(Deno.cwd(), '../', 'anima-fetchi', 'src', 'cli.ts')),
        'service:update:anime',
        '-a',
        identifier,
        '-u',
        updateType,
        '-l',
        locale,
      ],
      cwd: resolve(join(Deno.cwd(), '../', 'anima-fetchi')),
    },
  )
  const { code: _code, stdout, stderr: _stderr } = await proc.output()

  const stdOut = new TextDecoder().decode(stdout)

  return {
    code: _code,
    finishedTasks: stripColor(stdOut.split('succeeded:')?.[1]?.split('\n')?.[0] || '') || 0,
    failedTasks: stripColor(stdOut.split('failed:')?.[1]?.split('\n')?.[0] || '') || 0,
    anime: stripColor(stdOut.split('anime:')?.[1]?.split('\n')?.[0] || '') || 0,
  }
}
