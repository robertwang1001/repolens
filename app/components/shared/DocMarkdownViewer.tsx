'use client'

import { Button, Center, CloseButton, Dialog, Portal, Spinner, Stack, Text } from '@chakra-ui/react'
import { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react'
import { LuText, LuWrapText } from 'react-icons/lu'
import { useFetchDoc } from '~/hooks/useFetchDoc'

export type DocMarkdownViewerOnOpenChange = (open: boolean) => void

export interface DocMarkdownViewerProps {
  url: string
  title?: string
  open: boolean
  setOpen: (open: boolean) => void
  onOpenChange?: DocMarkdownViewerOnOpenChange
}

const DocCodeBlock = lazy(() => import('../ui/DocCodeBlock'))

const DocMarkdownViewer = memo(({ url, title: titleProp, open, setOpen, onOpenChange }: DocMarkdownViewerProps) => {
  const title = useMemo(() => titleProp || (url.match(/\/([^/]+)$/)?.[1] ?? ''), [url, titleProp])
  const language = useMemo(() => (url.match(/\.([^./]+)$/)?.[1]), [url])
  const { toFetch, toCancel, loading, error, doc } = useFetchDoc(url)

  useEffect(() => {
    if (open)
      toFetch()
    else
      toCancel()
    return () => {
      toCancel()
    }
  }, [open, toFetch, toCancel])

  const [wrap, setWrap] = useState(false)

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open)
        onOpenChange?.(e.open)
      }}
      scrollBehavior="inside"
      size={{ mdDown: 'full', md: 'lg', lg: 'xl' }}
    >
      <Dialog.Trigger asChild>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title maxW="full" truncate>
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body display="flex" flexDir="column" p={0} overflow="hidden">
              <Center flexGrow={1} minH={0} flexDir="column">
                {
                  error
                    ? (
                        <Stack gap="4">
                          <Text color="fg.error" fontSize="lg">{error}</Text>
                          <Button onClick={() => toFetch()} variant="subtle">Try again</Button>
                        </Stack>
                      )
                    : loading
                      ? <Spinner />
                      : doc
                        ? (
                            <Suspense fallback={<Spinner />}>
                              <DocCodeBlock code={doc} language={language} wrap={wrap} />
                            </Suspense>
                          )
                        : 'Empty'
                }
              </Center>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost">Close</Button>
              </Dialog.ActionTrigger>
              <Button variant="surface" onClick={() => setWrap(v => !v)}>
                { wrap ? <LuText /> : <LuWrapText />}
                { wrap ? 'Unwrap' : 'Wrap' }
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})

export default DocMarkdownViewer
