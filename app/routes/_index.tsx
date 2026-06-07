import { Box, Center, ClientOnly, Container, Heading, HStack, Skeleton, Spinner, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Logo from '~/components/shared/logo'
import { ColorModeButton } from '~/components/ui/color-mode'
import RepositoryList from '~/features/home/repository-list'
import SearchInput from '~/features/home/search-input'
import Toolbar from '~/features/home/toolbar'
import { useSearch } from '~/hooks/use-search'
import { APP_DESCRIPTION, APP_TITLE, APP_VERSION } from '~/lib/constants'

export function meta() {
  return [
    { title: APP_TITLE },
    { name: 'description', content: APP_DESCRIPTION },
  ]
}

function CenterSpinner() {
  return (
    <Center flexGrow={1}>
      <Spinner size="xl" />
    </Center>
  )
}

export default function Home() {
  const { fetcher } = useSearch()
  const [firstTimeLoad, setFirstTimeLoad] = useState(true)
  useEffect(() => {
    if (fetcher.data) {
      setFirstTimeLoad(false)
    }
  }, [fetcher])

  return (
    <Stack gap={[8, 12]} minH="100vh">
      <Container maxW="8xl">
        <Stack pt={[4, 8]} gap={[4, 8]} w="full">
          <Stack alignItems="center">
            <Logo showTitle />
            <Heading color="fg.muted" fontWeight="normal" size={['sm', 'lg']} textAlign="center">{APP_DESCRIPTION}</Heading>
          </Stack>
          <HStack justifyContent="center">
            <HStack w="2xl" flexShrink={1}>
              <SearchInput />
            </HStack>
          </HStack>
        </Stack>
      </Container>
      <Container maxW="8xl" flexGrow={1} minH={0} display="flex" flexDirection="column">
        <Stack gap={[2, 4]} flexGrow={1}>
          <ClientOnly fallback={<Skeleton h="24px" w="210px" />}>
            <Toolbar />
          </ClientOnly>
          <ClientOnly fallback={<CenterSpinner />}>
            { firstTimeLoad ? <CenterSpinner /> : <RepositoryList />}
          </ClientOnly>
        </Stack>
      </Container>
      <Box borderTopWidth={1} borderColor="border.muted">
        <Container maxW="8xl">
          <HStack py={[4, 8]} justifyContent="space-between" color="fg.subtle" fontSize="sm">
            <Text>
              Made with ❤️ by Sohwi @ 2026
            </Text>
            <HStack>
              <Text>
                v
                {APP_VERSION}
              </Text>
              <ColorModeButton />
            </HStack>
          </HStack>
        </Container>
      </Box>
    </Stack>
  )
}
