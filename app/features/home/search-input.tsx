import type { RepoSearchPageResult } from '~/types/repo-search'
import { Button, CloseButton, HStack, Input, InputGroup } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { useFetcher, useSearchParams } from 'react-router'
import { toaster } from '~/components/ui/toaster'
import { TEXT_QUERY_KEY } from '~/lib/constants'

function useSearch(query = '') {
  // Search
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })
  const search = async (query: string) => {
    try {
      await fetcher.load(`/api/search?textQuery=${encodeURIComponent(query)}`)
    }
    catch (error) {
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
      })
    }
  }

  useEffect(() => {
    search(query)
  }, [query])

  return { fetcher }
}

export default function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [textQuery, setTextQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const queryFromUrl = useMemo(
    () => searchParams.get(TEXT_QUERY_KEY) ?? '',
    [searchParams],
  )

  const { fetcher } = useSearch(queryFromUrl)

  useEffect(() => {
    setTextQuery(queryFromUrl)
  }, [queryFromUrl])

  const updateSearchParamQuery = (query: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (query)
        next.set(TEXT_QUERY_KEY, query)
      else next.delete(TEXT_QUERY_KEY)
      return next
    })
  }

  // Clear button
  const endElement = textQuery
    ? (
        <CloseButton
          size="md"
          onClick={() => {
            updateSearchParamQuery('')
            inputRef.current?.focus()
          }}
          me="-2"
          _hover={{
            bgColor: 'bg.emphasized',
          }}
        />
      )
    : undefined

  return (
    <HStack w="full">
      <InputGroup endElement={endElement}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search repositories..."
          size="xl"
          variant="subtle"
          value={textQuery}
          onChange={(e) => {
            setTextQuery(e.currentTarget.value)
          }}
          disabled={fetcher.state === 'loading'}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              updateSearchParamQuery(textQuery)
            }
          }}
        />
      </InputGroup>
      <Button onClick={() => updateSearchParamQuery(textQuery)} size="xl" bg="bg.subtle" variant="outline" disabled={fetcher.state === 'loading'}>
        <LuSearch />
        Search
      </Button>
    </HStack>
  )
}
