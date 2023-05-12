import { Anima } from "../../@types/anima.d.ts";

export type AnimaMediaMetadata = {
  [key: string]: Anima.RAW.AnimeMetadata
}

export function getLocaleMetadata<T, TM>(media: T, locale: string): TM {
  if (locale === 'pt-PT') {
    locale = 'pt-BR'
  }

  if (!media) return {} as TM
  //@ts-expect-error - i just don't wanna make that type
  if (media?.AnimeMetadata) {
    //@ts-expect-error - i just don't wanna make that type
    return media.AnimeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error - i just don't wanna make that type
  if (media?.AnimeEpisodeMetadata) {
    //@ts-expect-error - i just don't wanna make that type
    return media.AnimeEpisodeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error - i just don't wanna make that type
  if (media?.EpisodeMetadata) {
    //@ts-expect-error - i just don't wanna make that type
    return media.EpisodeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error - i just don't wanna make that type
  if (media?.categoryMetadata) {
    //@ts-expect-error - i just don't wanna make that type
    return media.categoryMetadata.find((metadata) => metadata.locale === locale) as TM
  }

  //@ts-expect-error - i just don't wanna make that type
  if (media?.CategoryMetadata) {
    //@ts-expect-error - i just don't wanna make that type
    return media.CategoryMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  return {} as TM
}