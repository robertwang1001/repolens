import type { Route } from '../+types/root'
import { LRUCache } from 'lru-cache'
import { data } from 'react-router'
import { octokit } from '~/lib/octokit.server'

interface ReadmeInfo {
  readmeLink: string
}

const cache = new LRUCache<string, ReadmeInfo>({ max: 100, ttl: 30 * 60_000 })

export async function loader({ request }: Route.LoaderArgs): Promise<ReadmeInfo> {
  try {
    const searchParams = new URL(request.url).searchParams
    const owner = searchParams.get('owner')?.trim()
    const repo = searchParams.get('repo')?.trim()
    const ref = searchParams.get('ref')?.trim()

    if (!owner || !repo) {
      throw data('Missing owner or repo', { status: 400 })
    }

    const cacheKey = JSON.stringify({ owner, repo, ref })
    const cacheValue = cache.get(cacheKey)
    if (cacheValue)
      return cacheValue

    const readme = await octokit.rest.repos.getReadme({ owner, repo, ref, headers: {
      accept: 'application/vnd.github+json',
    } })

    const downloadUrl = readme.data.download_url
    if (!downloadUrl) {
      throw data('No README download_url returned by GitHub', { status: 502 })
    }

    const result = { readmeLink: downloadUrl }
    cache.set(cacheKey, result)

    return result
  }
  catch (err: unknown) {
    // Octokit errors sometimes include status
    const maybeStatus = (err as { status?: number }).status
    const status = typeof maybeStatus === 'number' ? maybeStatus : 500

    throw data(
      { error: 'Failed to get README', details: (err as Error)?.message ?? String(err) },
      { status },
    )
  }
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=300, s-maxage=600',
  }
}
