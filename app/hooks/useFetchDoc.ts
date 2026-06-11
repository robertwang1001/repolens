import { useCallback, useRef, useState } from 'react'
import { fetchDoc } from '~/lib/fetchDoc'

export function useFetchDoc(defaultUrl?: string) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [doc, setDoc] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isAborted = () => !!abortControllerRef.current?.signal.aborted

  const toCancel = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const toFetch = useCallback(async (url = defaultUrl) => {
    if (!url) {
      setError('`url` cannot be empty')
      return
    }
    setLoading(true)
    setError(null)
    setDoc('')
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      const text = await fetchDoc(url, {
        abortController: abortControllerRef.current,
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
  }, [defaultUrl])

  return {
    toFetch,
    toCancel,
    loading,
    error,
    doc,
  }
}
