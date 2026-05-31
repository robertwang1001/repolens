import type { RepoSearchSortKey, SortDirection } from '~/types/repo-search'

/**
 * Convert a qualifier entry (key/value) into a GitHub search token.
 *
 * Examples:
 * - ("language", "TypeScript") -> "language:TypeScript"
 * - ("stars", ">500") -> "stars:>500"
 * - ("fork", false) -> "fork:false"
 */
function qualifierToToken(key: string, value: string | number | boolean): string {
  return `${key}:${String(value)}`
}

/**
 * Build the final GitHub repo search query string.
 *
 * Design decisions:
 * - Optional `login` adds `user:<login>` to scope results.
 * - `qualifiers` allow a structured UI while still using GitHub qualifiers.
 * - "best" sort omits explicit sorting to let GitHub rank by relevance.
 * - Empty query is not allowed in practice; we add a harmless fallback.
 */
export function buildRepoSearchQuery(params: {
  /** Optional user/org scope: user:<login> */
  login?: string

  /** Free text search part */
  textQuery?: string

  /** Key/value qualifiers (language, stars, archived, fork, topic, etc.) */
  qualifiers?: Record<string, string | number | boolean>

  /** Sort key */
  sortKey?: RepoSearchSortKey

  /** Sort direction */
  sortDir?: SortDirection
}): string {
  const {
    login,
    textQuery = '',
    qualifiers = {},
    sortKey = 'best',
    sortDir = 'desc',
  } = params

  const parts: string[] = []

  // 1) Optional login scoping:
  // GitHub repo search supports `user:<login>` for both user and org accounts.
  if (login && login.trim()) {
    parts.push(`user:${login.trim()}`)
  }

  // 2) Add structured qualifiers in a deterministic order.
  // (Sorting keys makes the output stable so caching works reliably.)
  const qualifierEntries = Object.entries(qualifiers).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  for (const [k, v] of qualifierEntries) {
    if (v === undefined || v === null || v === '')
      continue
    parts.push(qualifierToToken(k, v))
  }

  // 3) Add sort qualifier only when not "best".
  // "best" means we let GitHub’s default relevance apply.
  if (sortKey !== 'best') {
    parts.push(`sort:${sortKey}-${sortDir}`)
  }

  // 4) Add free text last.
  const trimmedText = textQuery.trim()
  if (trimmedText)
    parts.push(trimmedText)

  // 5) Avoid an empty query.
  // GitHub search doesn't like truly empty queries; this yields "all repos".
  if (parts.length === 0) {
    parts.push('stars:>=0')
  }

  return parts.join(' ')
}
