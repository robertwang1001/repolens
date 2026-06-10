import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki'
import { createShikiAdapter } from '@chakra-ui/react'
import waitUntil from 'async-wait-until'

let count = 0
let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | undefined

export const SHIKI_DEFAULT_LANGUAGE = 'text'

export const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import('shiki')
    return highlighter = await createHighlighter({
      langs: [SHIKI_DEFAULT_LANGUAGE, 'js', 'ts', 'tsx', 'html', 'css', 'json', 'bash', 'sql', 'go', 'java', 'c'],
      themes: ['github-dark-default', 'github-light-default'],
    })
  },
  theme: {
    light: 'github-light-default',
    dark: 'github-dark-default',
  },
})

let loadedlanguages: string[] | undefined
export function isIncludedInShikiLoaded(lang?: string) {
  if (!lang)
    return false
  const loaded = [SHIKI_DEFAULT_LANGUAGE, 'txt', 'plain', ...(loadedlanguages ?? [])]
  return loaded.includes(lang)
}

export async function ensureShikiLang(language?: string) {
  try {
    if (!language)
      return SHIKI_DEFAULT_LANGUAGE

    const safe = language.toLowerCase()
    if (isIncludedInShikiLoaded(safe))
      return safe

    await waitUntil(() => !!highlighter)
    if (!highlighter) {
      return SHIKI_DEFAULT_LANGUAGE
    }

    if (!loadedlanguages) {
      loadedlanguages = highlighter.getLoadedLanguages()
    }

    if (isIncludedInShikiLoaded(safe))
      return safe

    await highlighter.loadLanguage(safe as BundledLanguage)
    return safe
  }
  catch {
    return SHIKI_DEFAULT_LANGUAGE
  }
  finally {
    if (count >= 1) {
      highlighter = undefined
    }
    else {
      count++
    }
  }
}
