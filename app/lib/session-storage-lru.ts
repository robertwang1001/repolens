interface Options {
  /**
   * The maximum number of items to store in the cache.
   * @default 100
   */
  max?: number
  /**
   * Default time-to-live in milliseconds. Items without an explicit TTL
   * use this value.
   * - Omit (or pass `undefined`) for no expiry by default.
   * - Non-positive means immediate expiry.
   * @default undefined
   */
  ttl?: number
}

interface CacheEntry<T> {
  value: T
  /** Unix timestamp (ms) when the entry expires, or `null` for no expiry. */
  expiresAt: number | null
}

export class SessionStorageLRU<T> {
  private namespace: string
  private max: number
  private defaultTtl: number | undefined

  /**
   * Initialize the cache.
   * @param namespace The namespace for the cache.
   * @param options Options to configure the cache.
   */
  constructor(namespace: string, options: Options = {}) {
    this.max = options.max ?? 100
    this.defaultTtl = options.ttl
    this.namespace = namespace
    this.init()
  }

  private get keysKey(): string {
    return `${this.namespace}:__keys__`
  }

  private getKeys(): string[] {
    if (typeof sessionStorage === 'undefined')
      return []
    const keys = sessionStorage.getItem(this.keysKey)
    return keys ? JSON.parse(keys) : []
  }

  private saveKeys(keys: string[]): void {
    if (typeof sessionStorage === 'undefined')
      return
    sessionStorage.setItem(this.keysKey, JSON.stringify(keys))
  }

  private init(): void {
    if (typeof sessionStorage === 'undefined')
      return
    if (!sessionStorage.getItem(this.keysKey)) {
      this.saveKeys([])
    }
  }

  private getItemKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  public get(key: string): T | null {
    if (typeof sessionStorage === 'undefined')
      return null

    const itemKey = this.getItemKey(key)
    const raw = sessionStorage.getItem(itemKey)

    if (raw === null)
      return null

    let entry: CacheEntry<T>
    try {
      entry = JSON.parse(raw) as CacheEntry<T>
    }
    catch {
      return null
    }

    // Evict if expired.
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.remove(key)
      return null
    }

    const keys = this.getKeys()
    const index = keys.indexOf(key)
    if (index !== -1) {
      keys.splice(index, 1)
      keys.push(key)
      this.saveKeys(keys)
    }

    return entry.value
  }

  /**
   * Store a value.
   * @param key Cache key.
   * @param value Value to store.
   * @param ttl Time-to-live in milliseconds for this entry. Overrides the
   *   instance default. Pass `null` to explicitly store with no expiry.
   */
  public set(key: string, value: T, ttl?: number | null): void {
    if (typeof sessionStorage === 'undefined')
      return

    const keys = this.getKeys()
    const itemKey = this.getItemKey(key)

    const existingIndex = keys.indexOf(key)
    if (existingIndex !== -1) {
      keys.splice(existingIndex, 1)
    }

    keys.push(key)

    if (keys.length > this.max) {
      const lruKey = keys.shift()
      if (lruKey) {
        sessionStorage.removeItem(this.getItemKey(lruKey))
      }
    }

    const resolvedTtl = ttl !== undefined ? ttl : this.defaultTtl
    const expiresAt = resolvedTtl !== null && resolvedTtl !== undefined ? Date.now() + resolvedTtl : null

    const entry: CacheEntry<T> = { value, expiresAt }
    sessionStorage.setItem(itemKey, JSON.stringify(entry))
    this.saveKeys(keys)
  }

  public remove(key: string): void {
    if (typeof sessionStorage === 'undefined')
      return

    const keys = this.getKeys()
    const index = keys.indexOf(key)
    if (index !== -1) {
      keys.splice(index, 1)
      this.saveKeys(keys)
    }
    sessionStorage.removeItem(this.getItemKey(key))
  }

  public clear(): void {
    if (typeof sessionStorage === 'undefined')
      return

    const keys = this.getKeys()
    for (const key of keys) {
      sessionStorage.removeItem(this.getItemKey(key))
    }
    this.saveKeys([])
  }
}
