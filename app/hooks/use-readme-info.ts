import type { loader } from '~/routes/api.readme'
import { useFetcher } from 'react-router'
import { toaster } from '~/components/ui/toaster'
import { logger } from '~/lib/logger'

const log = logger.getChild('useReadmeInfo')

export function useReadmeInfo() {
  const fetcher = useFetcher<typeof loader>({ key: 'readmeInfo' })

  const load = async (owner: string, repo: string, path?: string) => {
    const searchParams = new URLSearchParams({ owner, repo })
    const pathTrimmed = path?.trim()
    if (pathTrimmed) {
      searchParams.set('path', pathTrimmed)
    }
    const url = `/api/readme?${searchParams.toString()}`
    const ownerRepo = `${owner}/${repo}${pathTrimmed ? `/${pathTrimmed}` : ''}`

    log.debug`Load ${ownerRepo}...`
    try {
      await fetcher.load(url)
      log.debug`Loaded ${ownerRepo}`
    }
    catch (error) {
      log.error`Failed to load ${ownerRepo}. ${error}`
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
      })
    }
  }

  return {
    load,
    fetcher,
  }
}
