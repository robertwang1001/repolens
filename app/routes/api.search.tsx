import type { Route } from './+types/_index'
import type { RepoSearchPageResult } from '~/types/repo-search'
import { octokit } from '~/lib/octokit.server'
import { createTTLCache } from '~/lib/ttl-cache'
import { createRepoSearchClient } from '~/services/search/create-repo-search-client'

const cache = createTTLCache<RepoSearchPageResult>({ ttlMs: 30 * 60_000, maxEntries: 300 })

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
