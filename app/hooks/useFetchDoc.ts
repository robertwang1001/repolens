import { useState } from 'react'
import { fetchDoc } from '~/lib/fetchDoc'

export function useFetchDoc(defaultUrl?: string) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [doc, setDoc] = useState<string | null>(null)
  let abortController: AbortController | null
  const isAborted = () => !!abortController?.signal.aborted

  const toCancel = () => {
    abortController?.abort()
  }

  const toFetch = async (url = defaultUrl) => {
    if (!url) {
      setError('`url` cannot be empty')
      return
    }
    setLoading(true)
    setError(null)
    setDoc('')
    abortController?.abort()
    abortController = new AbortController()

    try {
      const text = await fetchDoc(url, {
        abortController,
      })

      if (!isAborted())
        setDoc(text)
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

  return {
    toFetch,
    toCancel,
    loading,
    error,
    doc,
  }
}
