import { For, Link, Stack } from '@chakra-ui/react'
import { memo, useContext, useMemo } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import { useMarkdownScrollSpy } from '~/hooks/useMarkdownScrollSpy'
import { buildToc } from '~/lib/build-toc'
import { MarkdownContext } from './MarkdownContext'

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
          {({ id, depth, text }) => {
            const isActive = activeId === id
            return (
              <li key={id}>
                <Link
                  asChild
                  w="full"
                  pl={2 + 4 * depth}
                  pr={2}
                  py={1.5}
                  outline="none"
                  color="fg.muted"
                  textDecoration="none"
                  data-current={isActive ? true : undefined}
                  aria-current={isActive ? true : undefined}
                  _current={{
                    color: 'fg',
                    bgColor: 'bg.muted',
                  }}
                  _hover={{
                    bgColor: 'bg.muted',
                  }}
                >
                  <ReactRouterLink to={`#${id}`} replace>
                    {text}
                  </ReactRouterLink>
                </Link>
              </li>
            )
          }}
        </For>
      </Stack>
    </nav>
  )
})
