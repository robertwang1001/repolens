import { Box, HStack, Link } from '@chakra-ui/react'
import rehypeShiki from '@shikijs/rehype'
import { memo, useEffect, useMemo, useRef } from 'react'
import { LuExternalLink, LuView } from 'react-icons/lu'
import { MarkdownHooks } from 'react-markdown'
import { Link as ReactRouterLink } from 'react-router'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkGithub from 'remark-github'
import { remarkAlert } from 'remark-github-blockquote-alert'
import { GITHUB_ORIGIN } from '~/lib/constants'
import { normalizeInternalUrl } from '~/lib/normalizeInternalUrl'
import CenterSpinner from '../ui/CenterSpinner'
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

function Fallback({ onRendered, markdownContainerRef }: { onRendered?: DocMarkdownContentOnRendered, markdownContainerRef: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    return () => {
      const container = markdownContainerRef.current
      onRendered?.(container)
      // Scroll to anchor
      const hash = location.hash
      if (hash) {
        container?.querySelector(decodeURIComponent(hash))?.scrollIntoView()
      }
    }
  }, [onRendered, markdownContainerRef])

  return (
    <CenterSpinner />
  )
}

const DocMarkdownContent = memo(({ text, owner, repo, dirLink, ref, onRendered }: DocMarkdownContentProps) => {
  const markdownContainerRef = useRef<HTMLDivElement>(null)
  const ownerRepo = useMemo(() => `${owner}/${repo}`, [owner, repo])
  const baseUrl = useMemo(() => `${GITHUB_ORIGIN}/${ownerRepo}/blob/${ref}`, [ownerRepo, ref])

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
            light: 'github-light',
            dark: 'github-dark',
          },
        }], rehypeSlug]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        components={{
          a({ node: _, ...props }) {
            const normalAnchor = <a {...props} />
            if (!props.href)
              return normalAnchor

            const { url, internal } = normalizeInternalUrl(props.href, baseUrl)
            if (!internal) {
              return (
                <Link {...props} href={url}>
                  {props.children}
                  <LuExternalLink />
                </Link>
              )
            }

            if (url.toLowerCase().endsWith('.md') || !/\.[^/]+$/.test(url) /* Dir */) {
              return <ReactRouterLink to={`/${ownerRepo}/${url}`}>{ props.children }</ReactRouterLink>
            }
            else {
              return (
                <button title="Opens preview" data-url={`${dirLink}/${url}`}>
                  <HStack cursor="pointer" color="var(--fgColor-accent)" _hover={{ textDecoration: 'underline' }}>
                    { props.children }
                    <LuView />
                  </HStack>
                </button>
              )
            }
          },
          img({ node: _, ...props }) {
            if (!props.src)
              return <img {...props} />

            const maxHeight = props.height ? `${props.height}px` : undefined
            const height = props.height ? 'auto' : undefined
            const { url, internal } = normalizeInternalUrl(props.src, baseUrl)
            if (!internal)
              return <img {...props} style={{ maxHeight, height }} />

            return <img {...props} style={{ maxHeight, height }} src={`${dirLink}/${url}`} />
          },
        }}
        fallback={(
          <Fallback onRendered={onRendered} markdownContainerRef={markdownContainerRef} />
        )}
      >
        {text}
      </MarkdownHooks>
    </Box>
  )
})

export default DocMarkdownContent
