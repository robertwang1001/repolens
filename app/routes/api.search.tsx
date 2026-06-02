import type { Route } from './+types/_index'
import type { RepoSearchPageResult } from '~/types/repo-search'
import { LRUCache } from 'lru-cache'
import { octokit } from '~/lib/octokit.server'
import { createRepoSearchClient } from '~/services/search/create-repo-search-client'

const cache = new LRUCache<string, RepoSearchPageResult>({ max: 100, ttl: 30 * 60_000 })

const client = createRepoSearchClient({ octokit, cache })

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams
  const options: Record<string, any> = {}
  for (const [key, value] of searchParams) {
    if (value) {
      options[key] = value
    }
  }
  const data = await client.searchReposPage(options)
  return data
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=300, s-maxage=600',
  }
}
