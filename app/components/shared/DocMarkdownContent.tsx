import type { InternalUrlContext } from '~/lib/rehypeInternalUrlActions'
import { Box, Center, Spinner } from '@chakra-ui/react'
import rehypeShiki from '@shikijs/rehype'
import { memo, useEffect, useMemo, useRef } from 'react'
import { MarkdownHooks } from 'react-markdown'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkGithub from 'remark-github'
import { remarkAlert } from 'remark-github-blockquote-alert'
import { GITHUB_ORIGIN } from '~/lib/constants'
import rehypeInternalUrlActions from '~/lib/rehypeInternalUrlActions'
import '~/css/markdown.css'
import 'remark-github-blockquote-alert/alert.css'

export type DocMarkdownContentOnRendered = (markdownContainerRef: HTMLDivElement | null) => void

export interface DocMarkdownContentProps {
  text: string
  owner: string
  repo: string
  ref: string
  dirLink: string
  onRendered?: DocMarkdownContentOnRendered
}

function CenterSpinner() {
  return (
    <Center width="100%">
      <Spinner size="lg" />
    </Center>
  )
}

export default memo(({ text, owner, repo, dirLink, ref, onRendered }: DocMarkdownContentProps) => {
  const markdownContainerRef = useRef<HTMLDivElement>(null)
  const ownerRepo = useMemo(() => `${owner}/${repo}`, [owner, repo])

  const Fallback = () => {
    useEffect(() => {
      return () => {
        onRendered?.(markdownContainerRef.current)
        // Scroll to anchor
        const hash = location.hash
        if (hash) {
          markdownContainerRef.current?.querySelector(decodeURIComponent(hash))?.scrollIntoView()
        }
      }
    }, [])

    return (
      <CenterSpinner />
    )
  }

  return (
    <Box
      as="article"
      bgColor="transparent"
      _dark={{ bgColor: 'transparent' }}
      className="markdown-body"
      boxSize="full"
      ref={markdownContainerRef}
    >
      <MarkdownHooks
        remarkPlugins={[remarkGfm, [remarkGithub, { repository: ownerRepo }], remarkAlert, remarkEmoji]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer', 'nofollow'] }], [rehypeShiki, {
          themes: {
            light: 'github-light-default',
            dark: 'github-dark-default',
          },
        }], rehypeSlug, rehypeAutolinkHeadings, [rehypeInternalUrlActions, {
          base: `${GITHUB_ORIGIN}/${ownerRepo}/blob/${ref}`,
          onInternalUrl(ctx: InternalUrlContext) {
            const isAnchor = ctx.tagName === 'a' && ctx.attrName === 'href'
            const isAnchorMd = isAnchor && (ctx.url.toLowerCase().endsWith('.md') || !/\.[^/]+$/.test(ctx.url) /* Dir */)
            const url = ctx.url.replace(/^(?:\.\/|\/)?(.*)/, (_, p1) => `${isAnchorMd ? `/${ownerRepo}` : dirLink}/${p1}`)

            if (isAnchorMd) {
              ctx.setAttr('target', null)
              ctx.setAttr('rel', null)
              return {
                url,
              }
            }

            if (isAnchor) {
              ctx.removeAttr()
              ctx.setAttr('data-href', url)
              ctx.setAttr('role', 'button')
              ctx.setAttr('tabIndex', 0)
              ctx.setAttr('target', null)
              ctx.setAttr('rel', null)
              ctx.setAttr('title', 'Opens preview')
            }
            else {
              return {
                url,
              }
            }
          },
        }]]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        fallback={(
          <Fallback />
        )}
      >
        {text}
      </MarkdownHooks>
    </Box>
  )
})
