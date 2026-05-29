import type { RepoSearchPageResult } from '~/types/repo-search'
import { Box, Center, ClientOnly, Container, Heading, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import { useFetcher } from 'react-router'
import RepositoryList from '~/features/home/repository-list'
import SearchInput from '~/features/home/search-input'
import { APP_DESCRIPTION, APP_TITLE, APP_VERSION } from '~/lib/constants'

export function meta() {
  return [
    { title: APP_TITLE },
    { name: 'description', content: APP_DESCRIPTION },
  ]
}

function CenterSpinner() {
  return (
    <Center>
      <Spinner size="xl" />
    </Center>
  )
}

export default function Home() {
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })
  return (
    <Stack gap={8} minH="100vh">
      <Container maxW="8xl">
        <Stack py={8} gap={8} w="full">
          <Stack alignItems="center">
            <Heading as="h1" size="3xl">{APP_TITLE}</Heading>
            <Heading color="fg.muted" fontWeight="normal" size="lg">{APP_DESCRIPTION}</Heading>
          </Stack>
          <SearchInput />
        </Stack>
      </Container>
      <Container maxW="8xl" flexGrow={1}>
        <ClientOnly fallback={<CenterSpinner />}>
          {fetcher.state === 'loading' ? <CenterSpinner /> : <RepositoryList />}
        </ClientOnly>
      </Container>
      <Box borderTopWidth={1} borderColor="border.muted">
        <Container maxW="8xl">
          <HStack py={8} justifyContent="space-between" color="fg.subtle" fontSize="sm">
            <Text>
              Made with ❤️ by Sohwi @ 2026
            </Text>
            <Text>
              v
              {APP_VERSION}
            </Text>
          </HStack>
        </Container>
      </Box>
    </Stack>
  )
}
