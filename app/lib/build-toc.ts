import type { Options } from 'mdast-util-toc'
import { toc } from 'mdast-util-toc'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

export interface TocItem {
  /**
   * nesting level in the TOC (0 = top)
   */
  depth: number
  text: string
  /**
   * without '#'
   */
  id: string
}

function nodeToText(node: any): string {
  if (!node)
    return ''
  if (node.type === 'text')
    return node.value ?? ''
  if (node.type === 'inlineCode')
    return node.value ?? ''
  if (Array.isArray(node.children))
    return node.children.map(nodeToText).join('')
  return ''
}

export function buildToc(markdown: string, maxDepth: Options['maxDepth'] = 3): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown)

  const result = toc(tree, {
    maxDepth,
    // heading: null means we don't require a "Table of contents" heading marker
    heading: null,
  })

  const map = result.map // mdast "list" node representing the toc
  if (!map)
    return []

  const items: TocItem[] = []

  const walk = (node: any, depth: number) => {
    if (!node)
      return

    if (node.type === 'list') {
      node.children?.forEach((c: any) => walk(c, depth))
      return
    }

    if (node.type === 'listItem') {
      // listItem usually contains: paragraph -> link, and optionally nested list
      const paragraph = node.children?.find((c: any) => c.type === 'paragraph')
      const link = paragraph?.children?.find((c: any) => c.type === 'link')

      const url: string | undefined = link?.url
      const text = link ? nodeToText(link).trim() : ''

      if (url?.startsWith('#') && text) {
        items.push({ depth, text, id: url.slice(1) })
      }

      // nested list inside listItem increases depth
      node.children?.forEach((c: any) => {
        if (c.type === 'list')
          walk(c, depth + 1)
      })

      return
    }

    // fallback traversal
    node.children?.forEach((c: any) => walk(c, depth))
  }

  walk(map, 0)
  return items
}
