import type { RepoSearchPageResult } from '~/types/repo-search'
import { useCallback } from 'react'
import { useFetcher } from 'react-router'
import { logger } from '~/lib/logger'

const log = logger.getChild('useSearch')

export function useSearch() {
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })

  const search = useCallback(async (params?: URLSearchParams | Record<string, any>) => {
    const searchParams = new URLSearchParams(params)
    const searchParamsString = searchParams.toString()

    log.debug`Start to search with search params: ${searchParamsString}`
    await fetcher.load(`/api/search${searchParamsString ? `?${searchParamsString}` : ''}`)
    log.debug`Finish search with query: ${searchParamsString}`
  }, [])

  return {
    search,
    fetcher,
  }
}
