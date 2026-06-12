function isInternalUrl(url: string, base?: string): boolean {
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
    return base ? url.startsWith(base) : false
  }

  // otherwise it's relative (/x, ./x, x) => internal
  return true
}

export function normalizeInternalUrl(url: string, base?: string) {
  let result = url
  const internal = isInternalUrl(result, base)
  if (internal) {
    if (base && result.startsWith(base)) {
      result = result.substring(base.length)
    }
    result = result.replace(/^(?:\.\/|\/)?(.*)/, (_, p1) => p1)
  }
  return {
    url: result,
    internal,
  }
}
