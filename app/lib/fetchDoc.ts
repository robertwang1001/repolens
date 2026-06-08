import { logger } from '~/lib/logger'

interface Options {
  abortController?: AbortController
}

const log = logger.getChild('fetchDoc')

export async function fetchDoc(
  url: string,
  { abortController }: Options = {},
): Promise<string> {
  log.debug`Fetching doc. ${url} ...`

  const res = await fetch(url, {
    signal: abortController?.signal,
  })
  if (!res.ok)
    throw new Error(`Fetch failed: ${res.status}`)

  log.debug`Fetched doc.`

  // If streaming not available, fall back
  if (!res.body) {
    const text = await res.text()
    log.debug`Streaming unavailable.`
    return text
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  const parts: string[] = []

  log.debug`Reading streaming...`
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      log.debug`Finished reading`
      break
    }

    parts.push(decoder.decode(value, { stream: true }))
  }

  parts.push(decoder.decode()) // flush
  return parts.join('')
}
