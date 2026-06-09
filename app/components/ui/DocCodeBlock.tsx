'use client'

import type { FlexProps } from '@chakra-ui/react'
import type { HighlighterGeneric } from 'shiki'
import { CodeBlock, createShikiAdapter, Flex, Float, IconButton } from '@chakra-ui/react'
import { memo } from 'react'
import { useColorMode } from './color-mode'

const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import('shiki')
    return createHighlighter({
      langs: ['text', 'js', 'ts', 'tsx', 'html', 'css', 'json', 'yaml', 'bash', 'sql', 'dockerfile', 'go', 'java', 'c', 'c++', 'ruby', 'rust', 'swift', 'kotlin'],
      themes: ['github-dark-default', 'github-light-default'],
    })
  },
  theme: {
    light: 'github-light-default',
    dark: 'github-dark-default',
  },
})

interface DocCodeBlockProps {
  code: string
  language?: string
  wrap?: boolean
}

export default memo(({ code, language, wrap, ...flexProps }: DocCodeBlockProps & FlexProps) => {
  const { colorMode } = useColorMode()

  return (
    <Flex minH="full" w="full" {...flexProps}>
      <CodeBlock.AdapterProvider value={shikiAdapter}>
        <CodeBlock.Root
          code={code}
          language={language}
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
