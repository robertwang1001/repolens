import type { RepoListItem, RepoSearchPageResult } from '~/types/repo-search'
import { Box, EmptyState, For, SimpleGrid, Stack, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { TbMoodEmpty } from 'react-icons/tb'
import { useFetcher } from 'react-router'
import { logger } from '~/lib/logger'
import RepositoryListItem from './repository-list-item'
import RepositoryListToolbar from './repository-list-toolbar'

const log = logger.getChild('Repository List')

export default function RepositoryList() {
  const [repos, setRepos] = useState<RepoListItem[]>(() => [])
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })

  useEffect(() => {
    if (fetcher.data) {
      setRepos(fetcher.data.repos)
    }
    log.debug`Update repos with data: ${fetcher.data} `
  }, [fetcher.data])

  return (
    <Stack gap={[2, 4]}>
      <RepositoryListToolbar />
      <Box>
        {
          repos.length > 0
            ? (
                <SimpleGrid gap={[2, 4]} minChildWidth={['xs', 'sm']}>
                  <For each={repos}>
                    {repo => <RepositoryListItem key={repo.id} repo={repo} />}
                  </For>
                </SimpleGrid>
              )
            : (
                <EmptyState.Root>
                  <EmptyState.Content>
                    <EmptyState.Indicator>
                      <TbMoodEmpty />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                      <EmptyState.Title>
                        No result matches
                      </EmptyState.Title>
                      <EmptyState.Description>
                        Try adjust your search criteria
                      </EmptyState.Description>
                    </VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              )
        }
      </Box>
    </Stack>
  )
}
