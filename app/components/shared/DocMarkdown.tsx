import type { MouseEventHandler } from 'react'
import type { DocMarkdownContentProps } from './DocMarkdownContent'
import type { DocMarkdownViewerOnOpenChange } from './DocMarkdownViewer'
import { Box } from '@chakra-ui/react'
import { memo, useCallback, useState } from 'react'
import { logger } from '~/lib/logger'
import DocMarkdownContent from './DocMarkdownContent'
import DocMarkdownViewer from './DocMarkdownViewer'

const log = logger.getChild('DocMarkdown')

export default memo((props: DocMarkdownContentProps) => {
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined)
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined)
  const [viewerOpen, setViewerOpen] = useState(false)
  const onOpenChange = useCallback<DocMarkdownViewerOnOpenChange>((o) => {
    setViewerOpen(o)
  }, [])
  const onClick: MouseEventHandler<HTMLDivElement> = (evt) => {
    const el = evt.target instanceof Element ? evt.target.closest('a[role="button"][data-href]') : null
    if (!el)
      return

    const href = el.getAttribute('data-href')

    if (!href) {
      log.error`\`data-href\` is empty`
      return
    }

    setViewerUrl(href)
    setViewerTitle(el.textContent)
    setViewerOpen(true)
  }

  return (
    <Box
      w="full"
      h="full"
      css={{
        '& :is(h1,h2,h3,h4,h5,h6)': {
          scrollMarginTop: '80px',
        },
      }}
      onClick={onClick}
    >
      <DocMarkdownContent {...props} />
      <DocMarkdownViewer open={viewerOpen} url={viewerUrl ?? ''} title={viewerTitle} onOpenChange={onOpenChange} />
    </Box>
  )
})
