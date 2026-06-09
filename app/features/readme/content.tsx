import type { DocMarkdownContentOnRendered } from '~/components/shared/DocMarkdownContent'
import { Box, Button, ClientOnly, Stack, Text } from '@chakra-ui/react'
import { lazy, Suspense, useCallback, useContext, useEffect } from 'react'
import { useReadmeInfo } from '~/hooks/use-readme-info'
import { useFetchDoc } from '~/hooks/useFetchDoc'
import ContentHeader from './content-header'
import ContentSpinner from './content-spinner'
import { MarkdownContext } from './MarkdownContext'

const DocMarkdown = lazy(() => import('~/components/shared/DocMarkdown'))

export default function Content({ owner, repo, path }: { owner: string, repo: string, path?: string }) {
  const { fetcher, load } = useReadmeInfo()
  const { markdown, setMarkdown, setMarkdownContainer } = useContext(MarkdownContext)

  useEffect(() => {
    load(owner, repo, path)
  }, [owner, repo, path])

  const { toFetch, loading, error, doc, toCancel } = useFetchDoc()
  useEffect(() => {
    const url = fetcher.data?.readmeLink
    if (url) {
      toFetch(url)
    }
    return () => {
      toCancel()
    }
  }, [fetcher.data?.readmeLink])

  useEffect(() => {
    setMarkdown(doc ?? '')
  }, [doc])

  const refreshPage = useCallback(() => window.location.reload(), [])

  const onRendered = useCallback<DocMarkdownContentOnRendered>((el) => {
    setMarkdownContainer(el)
  }, [])

  return (
    <Stack minH="full" maxW="4xl" mx="auto" px={[4, 8]} pb={4}>
      <Box position="sticky" top={0} left={0} zIndex={1}>
        <ContentHeader owner={owner} repo={repo} repoUrl={`https://github.com/${owner}/${repo}`} />
      </Box>
      <Box>
        {error
          ? (
              <Stack>
                <Text color="fg.error">{error}</Text>
                <Button onClick={refreshPage}>Reload</Button>
              </Stack>
            )
          : loading
            ? <ContentSpinner />
            : (
                <ClientOnly fallback={<ContentSpinner />}>
                  <Suspense fallback={<ContentSpinner />}>
                    <DocMarkdown owner={owner} repo={repo} text={markdown} dirLink={fetcher.data?.dirLink ?? ''} onRendered={onRendered} />
                  </Suspense>
                </ClientOnly>
              )}
      </Box>
    </Stack>
  )
}
