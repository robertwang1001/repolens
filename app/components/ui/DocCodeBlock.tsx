'use client'

import type { FlexProps } from '@chakra-ui/react'
import { CodeBlock, Flex, Float, IconButton } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'
import { logger } from '~/lib/logger'
import { ensureShikiLang, isIncludedInShikiLoaded, SHIKI_DEFAULT_LANGUAGE, shikiAdapter } from '~/lib/shikiAdapter'
import { useColorMode } from './color-mode'

interface DocCodeBlockProps {
  code: string
  language?: string
  wrap?: boolean
}

const log = logger.getChild('DocCodeBlock')

export default memo(({ code, language: lang, wrap, ...flexProps }: DocCodeBlockProps & FlexProps) => {
  const { colorMode } = useColorMode()
  const [language, setLanguage] = useState<string | undefined>(() => (isIncludedInShikiLoaded(lang) ? lang : undefined))
  useEffect(() => {
    (async () => {
      if (language)
        return
      log.debug`Ensuring language ${lang ?? ''}...`
      const _language = await ensureShikiLang(lang)
      log.debug`Ensured language ${_language}`
      setLanguage(_language)
    })()
  }, [lang, language])

  return (
    <Flex minH="full" w="full" {...flexProps}>
      <CodeBlock.AdapterProvider value={shikiAdapter}>
        <CodeBlock.Root
          code={code}
          language={language ?? SHIKI_DEFAULT_LANGUAGE}
          meta={{ showLineNumbers: true, colorScheme: colorMode, wordWrap: wrap }}
          flexGrow={1}
          minH={0}
          w="full"
          display="flex"
          flexDir="column"
        >
          <CodeBlock.Content
            flexGrow={1}
            minH={0}
            display="flex"
            flexDir="column"
          >
            <Float placement="top-end" offset="5" zIndex="1">
              <CodeBlock.CopyTrigger asChild>
                <IconButton variant="ghost" size="2xs">
                  <CodeBlock.CopyIndicator />
                </IconButton>
              </CodeBlock.CopyTrigger>
            </Float>
            <CodeBlock.Code
              flexGrow={1}
              minH={0}
              overflowY="auto"
            >
              <CodeBlock.CodeText />
            </CodeBlock.Code>
          </CodeBlock.Content>
        </CodeBlock.Root>
      </CodeBlock.AdapterProvider>
    </Flex>
  )
})
