import type { RepoSearchPageResult } from '~/types/repo-search'
import { useFetcher } from 'react-router'
import { toaster } from '~/components/ui/toaster'
import { logger } from '~/lib/logger'

const log = logger.getChild('useSearch')

export function useSearch() {
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })

  const search = async (params?: URLSearchParams | Record<string, any>) => {
    const searchParams = new URLSearchParams(params)
    const searchParamsString = searchParams.toString()

    log.debug`Start to search with search params: ${searchParamsString}`
    try {
      await fetcher.load(`/api/search${searchParamsString ? `?${searchParamsString}` : ''}`)
      log.debug`Finish search with query: ${searchParamsString}`
    }
    catch (error) {
      log.error`Failed to search with query: ${searchParamsString}. ${error}`
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
      })
    }
  }

  return {
    search,
    fetcher,
  }
}
