import type { RepoListItem, RepoSearchPageResult } from '~/types/repo-search'
import { Button, For, HStack, SimpleGrid, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useFetcher, useSearchParams } from 'react-router'
import { TEXT_QUERY_KEY } from '~/lib/constants'
import { logger } from '~/lib/logger'
import RepositoryListEmpty from './repository-list-empty'
import RepositoryListItem from './repository-list-item'
import RepositoryListToolbar from './repository-list-toolbar'

const log = logger.getChild('Repository List')

export default function RepositoryList() {
  const [searchParams] = useSearchParams()
  const [repos, setRepos] = useState<RepoListItem[]>(() => [])
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })

  useEffect(() => {
    if (fetcher.data) {
      const { repos, isFirstFetch } = fetcher.data
      if (isFirstFetch) {
        setRepos(repos)
        log.debug`Update repos with data: ${fetcher.data}`
      }
      else {
        setRepos((_repos) => {
          return [..._repos, ...repos]
        })
        log.debug`Append repos with data: ${fetcher.data}`
      }
    }
  }, [fetcher.data])

  const loadMore = async () => {
    const urlSearchParams = new URLSearchParams()
    const query = searchParams.get(TEXT_QUERY_KEY)
    const endCursor = fetcher.data?.pageInfo.endCursor
    const hasNextPage = fetcher.data?.pageInfo.hasNextPage
    if (query) {
      urlSearchParams.set('textQuery', query)
    }
    if (hasNextPage && endCursor) {
      urlSearchParams.set('after', endCursor)
    }

    await fetcher.load(`/api/search${urlSearchParams.size > 0 ? `?${urlSearchParams.toString()}` : ''}`)
  }

  return (
    <Stack gap={[2, 4]}>
      <RepositoryListToolbar />
      <Stack gap="4">
        {
          repos.length > 0
            ? (
                <>
                  <SimpleGrid gap={[2, 4]} minChildWidth={['xs', 'sm']}>
                    <For each={repos}>
                      {repo => <RepositoryListItem key={repo.id} repo={repo} />}
                    </For>
                  </SimpleGrid>
                  {fetcher.data?.pageInfo.hasNextPage && fetcher.data?.pageInfo.endCursor && (
                    <HStack justifyContent="center">
                      <Button variant="subtle" disabled={fetcher.state === 'loading'} onClick={loadMore}>{ fetcher.state === 'loading' ? <Spinner /> : 'Load more' }</Button>
                    </HStack>
                  )}
                </>
              )
            : (
                <RepositoryListEmpty />
              )
        }
      </Stack>
    </Stack>
  )
}
