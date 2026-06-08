import type { Element, Properties, Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

type UrlAttrName = 'href' | 'src' | 'srcset'

/**
 * Context passed to the user callback.
 * - `node` is the actual HAST element (mutate it directly)
 * - `properties` is a convenience reference to node.properties (mutate it)
 */
export interface InternalUrlContext {
  node: Element
  properties: Properties
  tagName: string
  attrName: UrlAttrName

  /** Original URL string extracted from the attribute (or from a srcset candidate). */
  url: string

  /**
   * For srcset candidates, this includes the descriptor part like "1x" or "480w".
   * For href/src, it will be null.
   */
  srcsetDescriptor: string | null

  /**
   * Helper for users: remove the attribute currently being processed.
   * (For srcset, removes the entire srcset attribute.)
   */
  removeAttr: () => void

  /**
   * Helper for users: set any property. (Use `null`/`undefined` to remove.)
   */
  setAttr: (name: string, value: unknown) => void

  /**
   * If you pass `base`, absolute URLs that share origin are considered internal.
   */
  base?: string
}

export type InternalUrlActionResult
  = | void
    | {
    /** If provided, replaces the URL (href/src) or the current srcset candidate URL. */
      url?: string
    }

export interface Options {
  /**
   * Decide which attributes to inspect.
   * Defaults: href, src, srcset
   */
  attributes?: UrlAttrName[]

  /**
   * If provided, absolute URLs are considered internal only if same-origin as base.
   * Example: "https://mysite.com"
   */
  base?: string

  /**
   * Called for every internal URL occurrence.
   * You can rewrite url AND mutate node.properties (add/remove/update attributes).
   */
  onInternalUrl: (ctx: InternalUrlContext) => InternalUrlActionResult
}

const DEFAULT_ATTRS: UrlAttrName[] = ['href', 'src', 'srcset']

const rehypeInternalUrlActions: Plugin<[Options], Root> = (options) => {
  if (!options || typeof options.onInternalUrl !== 'function') {
    throw new TypeError('rehypeInternalUrlActions: options.onInternalUrl must be a function')
  }

  const attrs = options.attributes ?? DEFAULT_ATTRS

  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const properties = (node.properties ?? {}) as Properties
      node.properties = properties

      for (const attrName of attrs) {
        const raw = properties[attrName]

        // srcset is special: string like "a.jpg 1x, b.jpg 2x"
        if (attrName === 'srcset') {
          if (typeof raw === 'string') {
            const next = processSrcset(raw, node, properties, options)
            if (next === null) {
              // removed
              delete properties.srcset
            }
            else {
              properties.srcset = next
            }
          }
          else if (Array.isArray(raw)) {
            // If some pipeline normalized srcset into string[]
            const next = processSrcset(raw.join(', '), node, properties, options)
            if (next === null)
              delete properties.srcset
            else properties.srcset = next
          }
          continue
        }

        // href/src: usually string
        if (typeof raw !== 'string')
          continue
        if (!isRewritableInternalUrl(raw, options.base))
          continue

        const ctxBase = createCtx({
          node,
          properties,
          tagName: node.tagName,
          attrName,
          url: raw,
          srcsetDescriptor: null,
          base: options.base,
        })

        const res = options.onInternalUrl(ctxBase)

        // If user removed the attribute, nothing else to do.
        if (!(attrName in properties))
          continue

        // URL rewrite (optional)
        if (res && typeof res === 'object' && typeof res.url === 'string') {
          properties[attrName] = res.url
        }
      }
    })
  }
}

export default rehypeInternalUrlActions

// ---------------- helpers ----------------

function createCtx(input: Omit<InternalUrlContext, 'removeAttr' | 'setAttr'>): InternalUrlContext {
  const { properties, attrName } = input

  return {
    ...input,
    removeAttr: () => {
      // For srcset we delete srcset; for href/src delete that attr
      delete (properties as any)[attrName]
    },
    setAttr: (name, value) => {
      if (value === null || value === undefined || value === false) {
        delete (properties as any)[name]
      }
      else {
        (properties as any)[name] = value
      }
    },
  }
}

function isRewritableInternalUrl(url: string, base?: string): boolean {
  if (!url)
    return false

  // only fragment
  if (url.startsWith('#'))
    return false

  // ignore common non-http schemes
  if (/^(?:mailto|tel|sms|javascript|data):/i.test(url))
    return false

  // protocol-relative external: //cdn.com/x
  if (url.startsWith('//'))
    return false

  // absolute scheme
  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) {
    if (!base)
      return false
    try {
      const u = new URL(url)
      const b = new URL(base)
      return u.origin === b.origin
    }
    catch {
      return false
    }
  }

  // otherwise it's relative (/x, ./x, x) => internal
  return true
}

function processSrcset(
  srcset: string,
  node: Element,
  properties: Properties,
  options: Options,
): string | null {
  // Split candidates: "url 1x" | "url 480w"
  const candidates = srcset
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)

  const rewritten: string[] = []

  for (const cand of candidates) {
    const parts = cand.split(/\s+/)
    const url = parts[0] ?? ''
    const descriptor = parts.length > 1 ? parts.slice(1).join(' ') : ''

    if (!url || !isRewritableInternalUrl(url, options.base)) {
      rewritten.push(cand)
      continue
    }

    const ctx = createCtx({
      node,
      properties,
      tagName: node.tagName,
      attrName: 'srcset',
      url,
      srcsetDescriptor: descriptor || null,
      base: options.base,
    })

    const res = options.onInternalUrl(ctx)

    // If user removed srcset attribute entirely:
    if (!('srcset' in properties))
      return null

    const newUrl = res && typeof res === 'object' && typeof res.url === 'string' ? res.url : url
    rewritten.push(descriptor ? `${newUrl} ${descriptor}` : newUrl)
  }

  return rewritten.join(', ')
}
