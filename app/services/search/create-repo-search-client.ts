import type { Octokit } from 'octokit'
import type { TTLCache } from '~/lib/ttl-cache'
import type { RepoListItem, RepoSearchOptions, RepoSearchPageResult } from '~/types/repo-search'
import { buildRepoSearchQuery } from './build-repo-search-query'
import { SEARCH_REPOS } from './graphql-queries'

/**
 * Create a repo search client that:
 * - builds the GitHub query string
 * - executes the GraphQL search
 * - caches results by (queryString + pagination cursor)
 *
 * Keep this logic out of your UI so components stay simple.
 */
export function createRepoSearchClient(params: {
  /** Authenticated Octokit instance */
  octokit: Octokit

  /** TTL cache to reduce rate-limit usage */
  cache: TTLCache<RepoSearchPageResult>
}) {
  /**
   * Search repositories and return exactly one page.
   *
   * Typical UI flow:
   * - Call with after=null for page 1
   * - Use result.pageInfo.endCursor as `after` for next page
   */
  async function searchReposPage(options: RepoSearchOptions): Promise<RepoSearchPageResult> {
    const {
      login,
      textQuery = '',
      qualifiers = {},
      sortKey = 'best',
      sortDir = 'desc',
      first = 12,
      after = null,
    } = options

    // Build the query string that GitHub search understands.
    const queryString = buildRepoSearchQuery({
      login,
      textQuery,
      qualifiers,
      sortKey,
      sortDir,
    })

    // Cache key: must include everything that affects results.
    const cacheKey = JSON.stringify({ queryString, first, after })

    // Fast path: serve from cache.
    const cached = params.cache.get(cacheKey)
    if (cached)
      return cached

    // Execute GraphQL call.
    // NOTE: variable name is `searchQuery`, not `query` (Octokit restriction).
    const res = await params.octokit.graphql<{
      search: {
        repositoryCount: number
        pageInfo: { hasNextPage: boolean, endCursor?: string | null }
        nodes: Array<RepoListItem | null>
      }
    }>(SEARCH_REPOS, { searchQuery: queryString, first, after })

    // Normalize the response into our own stable shape.
    const payload: RepoSearchPageResult = {
      queryString,
      repositoryCount: res.search.repositoryCount,
      pageInfo: {
        hasNextPage: res.search.pageInfo.hasNextPage,
        endCursor: res.search.pageInfo.endCursor ?? null,
      },
      // `nodes` can include nulls; filter them out.
      repos: (res.search.nodes ?? []).filter((n): n is RepoListItem => Boolean(n)),
      isFirstFetch: !after,
    }

    // Store in cache.
    params.cache.set(cacheKey, payload)

    return payload
  }

  return { searchReposPage }
}
