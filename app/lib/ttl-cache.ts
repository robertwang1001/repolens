/**
 * Very small TTL cache interface.
 * Keeping it minimal makes it easy to swap to Redis later.
 */
export interface TTLCache<TValue> {
  /** Get value by key; returns null if missing or expired */
  get: (key: string) => TValue | null

  /** Set value by key with TTL applied internally */
  set: (key: string, value: TValue) => void
}

/**
 * Create an in-memory TTL cache.
 *
 * Why this exists:
 * - Repo search UIs easily spam the API (typing, pagination).
 * - Caching prevents repeated calls for the same query+cursor.
 *
 * Trade-offs:
 * - In-memory only: refresh clears cache.
 * - Per-process only: if you scale to multiple servers, each has its own cache.
 */
export function createTTLCache<TValue>(opts?: {
  /** How long to keep entries in ms (default 60 seconds) */
  ttlMs?: number

  /** Maximum number of entries before evicting oldest (default 300) */
  maxEntries?: number
}): TTLCache<TValue> {
  const ttlMs = opts?.ttlMs ?? 60_000
  const maxEntries = opts?.maxEntries ?? 300

  // Map preserves insertion order, so we can evict the oldest entry cheaply.
  const map = new Map<string, { value: TValue, expiresAt: number }>()

  function get(key: string): TValue | null {
    const hit = map.get(key)
    if (!hit)
      return null

    // TTL check: if expired, delete and act like it's missing.
    if (Date.now() > hit.expiresAt) {
      map.delete(key)
      return null
    }

    return hit.value
  }

  function set(key: string, value: TValue): void {
    map.set(key, { value, expiresAt: Date.now() + ttlMs })

    // Evict oldest if we exceed max entries.
    if (map.size > maxEntries) {
      const oldestKey = map.keys().next().value as string | undefined
      if (oldestKey)
        map.delete(oldestKey)
    }
  }

  return { get, set }
}
