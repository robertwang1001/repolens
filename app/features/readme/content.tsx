import { Box, Button, ClientOnly, Stack, Text } from '@chakra-ui/react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useReadmeInfo } from '~/hooks/use-readme-info'
import { fetchReadme } from '~/services/readme/fetch-readme'
import ContentHeader from './content-header'
import ContentMarkdown from './content-markdown'
import ContentSpinner from './content-spinner'
import { MarkdownContext } from './MarkdownContext'

export default function Content({ owner, repo }: { owner: string, repo: string }) {
  const { fetcher, load } = useReadmeInfo()
  const { markdown, setMarkdown } = useContext(MarkdownContext)

  useEffect(() => {
    load(owner, repo)
  }, [owner, repo])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const loadMarkdown = async (url: string, abortController?: AbortController) => {
    setLoading(true)
    setError(null)
    setMarkdown('')

    const isAborted = () => !!abortController?.signal.aborted

    try {
      const text = await fetchReadme(url, {
        abortController,
      })

      if (!isAborted())
        setMarkdown(text)
    }
    catch (e: unknown) {
      if (!isAborted())
        setError((e as Error)?.message ?? String(e))
    }
    finally {
      if (!isAborted())
        setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const url = fetcher.data?.readmeLink
    if (url) {
      loadMarkdown(url, controller)
    }
    return () => {
      controller.abort()
    }
  }, [fetcher.data?.readmeLink])

  const refreshPage = useCallback(() => window.location.reload(), [])

  return (
    <Stack minH="full" maxW="4xl" mx="auto" px={[4, 8]} pb={4}>
      <Box position="sticky" top={0} left={0}>
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
                  <ContentMarkdown owner={owner} repo={repo} text={markdown} />
                </ClientOnly>
              )}
      </Box>
    </Stack>
  )
}
