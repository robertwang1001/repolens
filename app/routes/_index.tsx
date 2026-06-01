import type { RepoSearchPageResult } from '~/types/repo-search'
import { Box, Center, ClientOnly, Container, Heading, HStack, Skeleton, Spinner, Stack, Text } from '@chakra-ui/react'
import { useFetcher } from 'react-router'
import Logo from '~/components/shared/logo'
import { ColorModeButton } from '~/components/ui/color-mode'
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
    <Stack gap={[8, 12]} minH="100vh">
      <Container maxW="8xl">
        <Stack pt={[4, 8]} gap={[4, 8]} w="full">
          <Stack alignItems="center">
            <HStack>
              <ClientOnly fallback={<Skeleton boxSize={['36px', '44px']} />}>
                <Logo />
              </ClientOnly>
              <Heading as="h1" size={['xl', '3xl']}>{APP_TITLE}</Heading>
            </HStack>
            <Heading color="fg.muted" fontWeight="normal" size={['sm', 'lg']} textAlign="center">{APP_DESCRIPTION}</Heading>
          </Stack>
          <HStack justifyContent="center">
            <HStack w="2xl" flexShrink={1}>
              <SearchInput />
            </HStack>
          </HStack>
        </Stack>
      </Container>
      <Container maxW="8xl" flexGrow={1}>
        <ClientOnly fallback={<CenterSpinner />}>
          <RepositoryList />
        </ClientOnly>
      </Container>
      <Box borderTopWidth={1} borderColor="border.muted">
        <Container maxW="8xl">
          <HStack py={[4, 8]} justifyContent="space-between" color="fg.subtle" fontSize="sm">
            <Text>
              Made with ❤️ by Sohwi @ 2026
            </Text>
            <HStack>
              <ColorModeButton />
              <Text>
                v
                {APP_VERSION}
              </Text>
            </HStack>
          </HStack>
        </Container>
      </Box>
    </Stack>
  )
}
