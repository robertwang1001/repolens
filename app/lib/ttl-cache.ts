/**
 * A very small TTL cache interface.
 */
export interface TTLCache<TValue> {
  get: (key: string) => TValue | null
  set: (key: string, value: TValue) => void
}

/**
 * Create an in-memory TTL cache.
 *
 * @remarks
 * - Great for UI-level caching of repo search pages keyed by query + cursor.
 * - NOT persistent: refresh = cache cleared.
 * - For multi-user server environments you might want Redis instead.
 */
export function createTTLCache<TValue>(opts?: {
  ttlMs?: number
  maxEntries?: number
}): TTLCache<TValue> {
  const ttlMs = opts?.ttlMs ?? 5 * 60_000
  const maxEntries = opts?.maxEntries ?? 300

  const map = new Map<string, { value: TValue, expiresAt: number }>()

  /**
   * Get value by key if it exists and is not expired.
   */
  function get(key: string): TValue | null {
    const hit = map.get(key)
    if (!hit)
      return null

    if (Date.now() > hit.expiresAt) {
      map.delete(key)
      return null
    }

    return hit.value
  }

  /**
   * Store value by key with TTL; evict oldest if we exceed maxEntries.
   */
  function set(key: string, value: TValue): void {
    map.set(key, { value, expiresAt: Date.now() + ttlMs })

    if (map.size > maxEntries) {
      const firstKey = map.keys().next().value as string | undefined
      if (firstKey)
        map.delete(firstKey)
    }
  }

  return { get, set }
}
