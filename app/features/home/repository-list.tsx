import type { RepoListItem, RepoSearchPageResult } from '~/types/repo-search'
import { Box, Button, Card, EmptyState, For, Heading, HStack, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { AiOutlineRead } from 'react-icons/ai'
import { GoLaw } from 'react-icons/go'
import { LuGitFork, LuStar } from 'react-icons/lu'
import { TbMoodEmpty } from 'react-icons/tb'
import { useFetcher } from 'react-router'
import { format } from 'timeago.js'
import { Tooltip } from '~/components/ui/tooltip'

const { format: dateFormat } = Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function RepositoryListItem({ repo }: { repo: RepoListItem }) {
  const updatedAt = useMemo(() => dateFormat(new Date(repo.updatedAt)), [repo.updatedAt])
  const updatedAtAgo = useMemo(() => format(repo.updatedAt), [repo.updatedAt])

  return (
    <Card.Root>
      <Card.Header>
        <Box>
          <Link href={repo.url} target="_blank" rel="noopener noreferrer" maxW="full">
            <Heading size="xl" truncate>{repo.name}</Heading>
          </Link>
        </Box>
      </Card.Header>
      <Card.Body gap="4">
        <Card.Description lineClamp={3} flexGrow={1} fontWeight="semibold">
          {repo.description}
        </Card.Description>
        <HStack gap={4} fontSize="xs" color="fg.muted">
          { repo.primaryLanguage && (
            <HStack gap={1}>
              <Box w="3" h="3" borderWidth={1} borderColor="border.emphasized" rounded="full" style={{ backgroundColor: repo.primaryLanguage.color ?? 'gray' }}></Box>
              <Text>{ repo.primaryLanguage.name }</Text>
            </HStack>
          )}
          <Link href={`${repo.url}/stargazers`} target="_blank" rel="noopener noreferrer">
            <HStack gap={1} color="fg.muted">
              <LuStar size="14" />
              <Text>
                {repo.stargazerCount.toLocaleString()}
              </Text>
            </HStack>
          </Link>
          <Link href={`${repo.url}/forks`} target="_blank" rel="noopener noreferrer">
            <HStack gap={1} color="fg.muted">
              <LuGitFork size="14" />
              <Text>
                {repo.forkCount.toLocaleString()}
              </Text>
            </HStack>
          </Link>
          { repo.licenseInfo && (
            <HStack gap={1} flexGrow={1} minW={0}>
              <GoLaw size="14" />
              <Text textWrap="nowrap" truncate>
                { repo.licenseInfo.spdxId }
                {' '}
                License
              </Text>
            </HStack>
          )}
        </HStack>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Tooltip content={updatedAt}>
          <Text fontSize="sm" color="fg.muted">{updatedAtAgo}</Text>
        </Tooltip>
        <Tooltip content="Working in Progress...">
          <Button variant="outline" disabled>
            <AiOutlineRead />
            Readme
          </Button>
        </Tooltip>
      </Card.Footer>
    </Card.Root>
  )
}

export default function RepositoryList() {
  const [repos, setRepos] = useState<RepoListItem[]>(() => [])
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })

  useEffect(() => {
    if (fetcher.data) {
      setRepos(fetcher.data.repos)
    }
  }, [fetcher.data])

  return (
    <Box>
      {
        repos.length > 0
          ? (
              <SimpleGrid gap={4} minChildWidth="xs">
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
  )
}
