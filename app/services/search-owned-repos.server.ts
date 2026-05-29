import type { Except } from 'type-fest'
import type { RepoSearchOptions, RepoSearchPageResult } from '~/types/repo-search'
import { octokit } from '~/lib/octokit.server'
import { createTTLCache } from '~/lib/ttl-cache'
import { createRepoSearchClient } from './create-repo-search-client'

const cache = createTTLCache<RepoSearchPageResult>({ ttlMs: 5 * 60_000, maxEntries: 300 })

const client = createRepoSearchClient({ octokit, cache, debounceMs: 300 })

export async function searchOwnedRepos(options: Except<RepoSearchOptions, 'after'>, pageInfo?: RepoSearchPageResult['pageInfo']): Promise<RepoSearchPageResult | null> {
  // if (!pageInfo?.hasNextPage || !pageInfo?.endCursor)
  //   return null

  return client.searchOwnedReposPage({
    ...options,
    after: pageInfo?.endCursor,
  })
}
