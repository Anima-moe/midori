import {
  SqliteOrm,
  SqlTable,
} from 'https://raw.githubusercontent.com/Blockzilla101/deno-sqlite-orm/0.5.0/mod.ts'
import * as harmony from 'https://deno.land/x/harmony@v2.8.0/mod.ts'
import { crayon } from 'https://deno.land/x/crayon@3.3.3/mod.ts'
import dayjs from 'npm:dayjs@1.11.7'
import parser from 'https://deno.land/x/yargs_parser@yargs-parser-v21.1.1-deno/deno.ts'
import { Cache } from 'https://deno.land/x/local_cache@1.0/mod.ts'
import { initTranslation, load, Translations } from "https://deno.land/x/t_i18n@2.1.0/mod.ts"
import { Cron } from "https://deno.land/x/croner@6.0.3/dist/croner.js"

import ptBR from '@/language/pt-BR.ts'
const translator = initTranslation<typeof ptBR>()
const t = function(locale: string, key: Translations<typeof ptBR>, args?: { [key: string]: string | number }) {
  return translator(locale, key, args) || key
}

const orm = new SqliteOrm({ dbPath: './data/midori.db' })

load('pt-BR', ptBR)

export { Cache, crayon, dayjs, harmony, orm, parser as argParser, SqlTable, initTranslation, t, Cron }
