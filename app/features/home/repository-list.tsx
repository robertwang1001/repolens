import type { RepoListItem } from '~/types/repo-search'
import { Button, For, HStack, SimpleGrid, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useSearch } from '~/hooks/use-search'
import { TEXT_QUERY_KEY } from '~/lib/constants'
import { logger } from '~/lib/logger'
import RepositoryListEmpty from './repository-list-empty'
import RepositoryListItem from './repository-list-item'

const log = logger.getChild('Repository List')

export default function RepositoryList() {
  const [searchParams] = useSearchParams()
  const [repos, setRepos] = useState<RepoListItem[]>(() => [])
  const { fetcher, search } = useSearch()

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

    await search(urlSearchParams)
  }

  return (
    <Stack gap="4">
      {
        fetcher.data?.repositoryCount ?? -1 > 0
          ? (
              <>
                <SimpleGrid gap={[2, 4]} minChildWidth={['xs', 'sm']}>
                  <For each={repos}>
                    {repo => <RepositoryListItem key={repo.id} repo={repo} />}
                  </For>
                </SimpleGrid>
                {searchParams.size > 0 && fetcher.data?.pageInfo.hasNextPage && fetcher.data?.pageInfo.endCursor && (
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
  )
}
