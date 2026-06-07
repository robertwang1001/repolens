import { Box, Center } from '@chakra-ui/react'
import { memo, useContext, useEffect, useRef } from 'react'
import { MarkdownHooks } from 'react-markdown'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStarryNight from 'rehype-starry-night'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkGithub from 'remark-github'
import { remarkAlert } from 'remark-github-blockquote-alert'
import ContentSpinner from './content-spinner'
import { MarkdownContext } from './MarkdownContext'
import '~/css/markdown.css'
import 'remark-github-blockquote-alert/alert.css'

export default memo(({ text, owner, repo }: { text: string, owner: string, repo: string }) => {
  const { setMarkdownContainer } = useContext(MarkdownContext)

  const markdownContainerRef = useRef<HTMLDivElement>(null)

  const CenterSpinner = () => {
    useEffect(() => {
      return () => {
        setMarkdownContainer(markdownContainerRef.current)
      }
    }, [])

    return (
      <Center width="100%">
        <ContentSpinner />
      </Center>
    )
  }

  return (
    <Box
      as="article"
      w="full"
      h="full"
      bgColor="transparent"
      _dark={{ bgColor: 'transparent' }}
      className="markdown-body"
      css={{
        '& :is(h1,h2,h3,h4,h5,h6)': {
          scrollMarginTop: '80px',
        },
      }}
      ref={markdownContainerRef}
    >
      <MarkdownHooks
        remarkPlugins={[remarkGfm, [remarkGithub, { repository: `${owner}/${repo}` }], remarkAlert, remarkEmoji]}
        rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer', 'nofollow'] }], rehypeStarryNight, rehypeSlug, rehypeAutolinkHeadings]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        fallback={(
          <CenterSpinner />
        )}
      >
        {text}
      </MarkdownHooks>
    </Box>
  )
})
