import type { RepoListItem } from '~/types/repo-search'
import { Box, Button, Card, Heading, HStack, Link, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { AiOutlineRead } from 'react-icons/ai'
import { GoLaw } from 'react-icons/go'
import { LuGitFork, LuStar } from 'react-icons/lu'
import { format } from 'timeago.js'
import { Tooltip } from '~/components/ui/tooltip'

const { format: dateFormat } = Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})

export default function RepositoryListItem({ repo }: { repo: RepoListItem }) {
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
