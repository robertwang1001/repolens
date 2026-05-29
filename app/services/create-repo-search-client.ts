import type { Octokit } from 'octokit'
import type { TTLCache } from '~/lib/ttl-cache'
import type { RepoListItem, RepoSearchOptions, RepoSearchPageResult } from '~/types/repo-search'
import { debounceAsync } from '~/lib/debounce-async'
import { buildRepoSearchQuery } from './build-repo-search-query'
import { SEARCH_REPOS } from './graphql-queries'

/**
 * Create a repo search client.
 *
 * @remarks
 * This concentrates:
 * - auth / octokit dependency
 * - caching
 * - GraphQL query execution
 *
 * So your UI only calls `client.searchOwnedReposPage(...)`.
 */
export function createRepoSearchClient(params: {
  octokit: Octokit
  cache: TTLCache<RepoSearchPageResult>
  debounceMs?: number
}) {
  const debounceMs = params.debounceMs ?? 300

  /**
   * Search owned repositories and return one page.
   *
   * @remarks
   * - Cursor pagination: pass `after` from the previous response to get the next page.
   * - Default page size is 12 (if not provided).
   * - Results are cached by `{queryString, first, after}`.
   */
  async function searchOwnedReposPage(options: RepoSearchOptions): Promise<RepoSearchPageResult> {
    const {
      login,
      textQuery = '',
      scope = 'narrow',
      sortKey = 'updated',
      sortDir = 'desc',
      first = 12,
      after = null,
    } = options

    const queryString = buildRepoSearchQuery({
      login,
      textQuery,
      scope,
      sortKey,
      sortDir,
      includeForks: false,
    })

    const cacheKey = JSON.stringify({ queryString, first, after })
    const cached = params.cache.get(cacheKey)
    if (cached)
      return cached

    const res = await params.octokit.graphql<{
      search: {
        repositoryCount: number
        pageInfo: { hasNextPage: boolean, endCursor?: string | null }
        nodes: Array<RepoListItem | null>
      }
    }>(SEARCH_REPOS, { searchQuery: queryString, first, after })

    const payload: RepoSearchPageResult = {
      queryString,
      repositoryCount: res.search.repositoryCount,
      pageInfo: {
        hasNextPage: res.search.pageInfo.hasNextPage,
        endCursor: res.search.pageInfo.endCursor ?? null,
      },
      repos: (res.search.nodes ?? []).filter((n): n is RepoListItem => Boolean(n)),
    }

    params.cache.set(cacheKey, payload)
    return payload
  }

  /**
   * Debounced version of `searchOwnedReposPage`.
   *
   * @remarks
   * Use this for "search as you type" inputs.
   * If the user keeps typing, older pending calls are rejected.
   */
  const searchOwnedReposPageDebounced = debounceAsync(searchOwnedReposPage, debounceMs)

  return {
    searchOwnedReposPage,
    searchOwnedReposPageDebounced,
  }
}
