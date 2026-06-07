import { createContext } from 'react'

export const MarkdownContext = createContext<{
  markdown: string
  setMarkdown: React.Dispatch<React.SetStateAction<string>>
  markdownContainer: HTMLDivElement | null
  setMarkdownContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
}>({ markdown: '', setMarkdown: () => void (0), markdownContainer: null, setMarkdownContainer: () => void (0) })
