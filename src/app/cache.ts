import { Cache } from '@/deps.ts'

const cacheCollection = new Map<string, Cache<string, any>>()

export function ensure<T>(key: string, ttl: number) {
  if (!cacheCollection.has(key)) {
    cacheCollection.set(
      key,
      new Cache(ttl),
    )
  }

  return cacheCollection.get(key) as Cache<string, T>
}

export function getCache(key: string) {
  return cacheCollection.get(key)
}

export function deleteCache(key: string) {
  return cacheCollection.delete(key)
}

export function clearCache() {
  return cacheCollection.clear()
}

export function getCacheCollection() {
  return cacheCollection
}
