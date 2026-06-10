import type { ReactElement } from 'react'
import type { Route } from '../+types/root'
import { Box, HStack, Separator } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import LogoLinkable from '~/components/shared/logo-linkable'
import { ColorModeButton } from '~/components/ui/color-mode'
import Content from '~/features/readme/content'
import { MarkdownContext } from '~/features/readme/MarkdownContext'
import Sidebar from '~/features/readme/sidebar'
import { APP_DESCRIPTION, APP_TITLE } from '~/lib/constants'

export function meta() {
  return [
    { title: APP_TITLE },
    { name: 'description', content: APP_DESCRIPTION },
  ]
}

export default function ReadmeRoute({ params }: Route.ComponentProps): ReactElement {
  const { owner, repo } = params
  if (!owner || !repo)
    throw new Error('Owner and repo is required')

  const path = params['*'].trim()

  const [markdown, setMarkdown] = useState<string>('')
  const [markdownContainer, setMarkdownContainer] = useState<HTMLDivElement | null>(null)
  const providedValue = useMemo(() => ({ markdown, setMarkdown, markdownContainer, setMarkdownContainer }), [markdown, markdownContainer])

  return (
    <MarkdownContext value={providedValue}>
      <HStack flexDir={['column', 'column', 'row']} h="vh" w="vw" gap={0}>
        <HStack p={4} hideFrom="md" w="full" justifyContent="space-between">
          <LogoLinkable showTitle />
          <ColorModeButton />
        </HStack>
        <Box h="full" w={[undefined, undefined, 'xs', 'md', 'lg']} hideBelow="md">
          <Sidebar />
        </Box>
        <Separator orientation="vertical" h="full" hideBelow="md" />
        <Box w="full" h="full" overflowY="scroll">
          <Content owner={owner} repo={repo} path={path} />
        </Box>
      </HStack>
    </MarkdownContext>
  )
}
