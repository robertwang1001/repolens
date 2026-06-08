import { For, Stack } from '@chakra-ui/react'
import { memo, useContext, useMemo } from 'react'
import { useMarkdownScrollSpy } from '~/hooks/useMarkdownScrollSpy'
import { buildToc } from '~/lib/build-toc'
import { MarkdownContext } from './MarkdownContext'
import SidebarTocItem from './sidebar-toc-item'

export default memo(() => {
  const { markdown, markdownContainer } = useContext(MarkdownContext)
  const toc = useMemo(() => buildToc(markdown), [markdown])

  const ids = useMemo(() => toc.map(t => t.id), [toc])

  const activeId = useMarkdownScrollSpy(markdownContainer, ids, {
    rootMargin: '-80px 0px -70% 0px',
  })

  return (
    <nav aria-label="Table of contents">
      <Stack as="ul" gap={0}>
        <For each={toc}>
          {(tocItem) => {
            const isActive = activeId === tocItem.id
            return (
              <li key={tocItem.id}>
                <SidebarTocItem {...tocItem} isActive={isActive} />
              </li>
            )
          }}
        </For>
      </Stack>
    </nav>
  )
})
