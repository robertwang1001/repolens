import type { HighlightProps } from '@chakra-ui/react'
import type { RepoListItem } from '~/types/repo-search'
import { Avatar, Badge, Box, Button, Card, For, Heading, Highlight, HStack, Link, Text } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { AiOutlineRead } from 'react-icons/ai'
import { GoLaw } from 'react-icons/go'
import { LuExternalLink, LuGitFork, LuStar } from 'react-icons/lu'
import { Link as ReactRouterLink, useSearchParams } from 'react-router'
import { format } from 'timeago.js'
import { Tooltip } from '~/components/ui/tooltip'
import { TEXT_QUERY_KEY } from '~/lib/constants'

const { format: dateFormat } = Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})

export default memo(({ repo }: { repo: RepoListItem }) => {
  const updatedAt = useMemo(() => dateFormat(new Date(repo.pushedAt ?? repo.updatedAt)), [repo.pushedAt, repo.updatedAt])
  const updatedAtAgo = useMemo(() => format(repo.pushedAt ?? repo.updatedAt), [repo.pushedAt, repo.updatedAt])
  const [searchParams] = useSearchParams()
  const textQuery = searchParams.get(TEXT_QUERY_KEY) ?? ''

  const HighlightText = ({ children, ...props }: Omit<HighlightProps, 'query'>) => (
    <Highlight {...props} query={textQuery.split(' ')} styles={{ bg: 'gray.muted', px: '0.5' }} ignoreCase>
      { children }
    </Highlight>
  )

  return (
    <Card.Root>
      <Card.Header>
        <HStack>
          <Avatar.Root size="xs">
            <Avatar.Fallback name={repo.owner.login} />
            <Avatar.Image src={repo.owner.avatarUrl} />
          </Avatar.Root>
          <Box flexGrow={1} minW={0}>
            <Link href={repo.url} target="_blank" rel="noopener noreferrer" maxW="full">
              <Heading size="xl" truncate>
                {repo.owner.login}
                /
                <HighlightText>
                  {repo.name}
                </HighlightText>
              </Heading>
              <Box flexShrink={0} color="fg.muted">
                <LuExternalLink />
              </Box>
            </Link>
          </Box>
        </HStack>
      </Card.Header>
      <Card.Body gap="4">
        <Card.Description lineClamp={3} flexGrow={1} fontWeight="semibold">
          {repo.description && (
            <HighlightText>
              {repo.description}
            </HighlightText>
          )}
        </Card.Description>
        {(repo.repositoryTopics?.nodes && repo.repositoryTopics.nodes.length > 0) && (
          <HStack flexWrap="wrap">
            <For each={repo.repositoryTopics.nodes.map(n => n.topic?.name).filter(Boolean)}>
              {(item, index) => (
                <ReactRouterLink to={`/?${TEXT_QUERY_KEY}=${item}`} key={index}>
                  <Badge _hover={{ bgColor: 'blue.muted' }}>{ item }</Badge>
                </ReactRouterLink>
              )}
            </For>
          </HStack>
        )}
        <HStack gap={4} fontSize="xs" color="fg.muted">
          { repo.primaryLanguage && (
            <HStack gap={1}>
              <Box w="3" h="3" borderWidth={1} borderColor="border.emphasized" rounded="full" style={{ backgroundColor: repo.primaryLanguage.color ?? 'gray' }}></Box>
              <Text>{ repo.primaryLanguage.name }</Text>
            </HStack>
          )}
          <HStack gap={1} color="fg.muted">
            <LuStar size="14" />
            <Text>
              {repo.stargazerCount.toLocaleString()}
            </Text>
          </HStack>
          <HStack gap={1} color="fg.muted">
            <LuGitFork size="14" />
            <Text>
              {repo.forkCount.toLocaleString()}
            </Text>
          </HStack>
          { repo.licenseInfo && (
            <HStack gap={1} flexGrow={1} minW={0}>
              <Box flexShrink={0}>
                <GoLaw size="14" />
              </Box>
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
          <Text fontSize="sm" color="fg.muted">
            Updated
            {' '}
            {updatedAtAgo}
          </Text>
        </Tooltip>
        <Button variant="outline" asChild>
          <ReactRouterLink to={`/${repo.owner.login}/${repo.name}`}>
            <AiOutlineRead />
            Readme
          </ReactRouterLink>
        </Button>
      </Card.Footer>
    </Card.Root>
  )
})
