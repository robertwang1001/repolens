import type { Route } from '../+types/root'
import { dirname, join } from 'node:path'
import { LRUCache } from 'lru-cache'
import { data } from 'react-router'
import { octokit } from '~/lib/octokit.server'

interface ReadmeInfo {
  readmeLink: string
  dirLink: string
}

const cache = new LRUCache<string, ReadmeInfo>({ max: 100, ttl: 30 * 60_000 })

export async function loader({ request }: Route.LoaderArgs): Promise<ReadmeInfo> {
  try {
    const searchParams = new URL(request.url).searchParams
    const owner = searchParams.get('owner')?.trim()
    const repo = searchParams.get('repo')?.trim()
    const ref = searchParams.get('ref')?.trim()
    const path = searchParams.get('path')?.trim()

    if (!owner || !repo) {
      throw data('Missing owner or repo', { status: 400 })
    }

    const cacheKey = JSON.stringify({ owner, repo, ref, path })
    const cacheValue = cache.get(cacheKey)
    if (cacheValue)
      return cacheValue

    let readme
    const isDir = (path: any): path is string => path && !path.toLowerCase().endsWith('.md')
    if (isDir(path)) {
      readme = await octokit.rest.repos.getReadmeInDirectory({ owner, repo, ref, dir: path, headers: {
        accept: 'application/vnd.github+json',
      } })
    }
    else {
      readme = await octokit.rest.repos.getReadme({ owner, repo, ref, headers: {
        accept: 'application/vnd.github+json',
      } })
    }

    const downloadUrl = readme.data.download_url
    if (!downloadUrl) {
      throw data('No README download_url returned by GitHub', { status: 502 })
    }

    const dirLink = dirname(downloadUrl)
    const readmeLink = path && !isDir(path) ? join(dirLink, path) : downloadUrl

    const result: ReadmeInfo = { readmeLink, dirLink }
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
