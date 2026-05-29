import type { RepoSearchScope, RepoSearchSortKey, SortDirection } from '~/types/repo-search'

/**
 * Build a GitHub repo search query string for "owned repositories".
 *
 * @remarks
 * Satisfies:
 * - owned-only via `user:<login>`
 * - exclude forks by default via `fork:false`
 * - empty textQuery still yields a useful first page (e.g. updated-desc)
 * - narrow scope uses `in:name in:description in:readme`
 */
export function buildRepoSearchQuery(params: {
  login: string
  textQuery?: string
  scope?: RepoSearchScope
  sortKey?: RepoSearchSortKey
  sortDir?: SortDirection
  includeForks?: boolean
}): string {
  const {
    login,
    textQuery = '',
    scope = 'narrow',
    sortKey = 'updated',
    sortDir = 'desc',
    includeForks = false,
  } = params

  if (!login)
    throw new Error('login is required')

  const q: string[] = []

  // Owned constraint
  q.push(`user:${login}`)

  // Owned repos UX usually excludes forks
  if (!includeForks)
    q.push('fork:false')

  const trimmed = textQuery.trim()

  // Restrict where free-text is matched (default behavior)
  if (trimmed && scope === 'narrow') {
    q.push('in:name', 'in:description', 'in:readme')
  }

  // Sorting: omit if best match (lets GitHub do relevance ranking)
  if (sortKey !== 'best') {
    q.push(`sort:${sortKey}-${sortDir}`)
  }

  // Add user's text query last
  if (trimmed)
    q.push(trimmed)

  return q.join(' ')
}
