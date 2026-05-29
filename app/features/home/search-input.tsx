import type { RepoSearchPageResult } from '~/types/repo-search'
import { Button, CloseButton, HStack, Input, InputGroup, Spinner } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { useFetcher, useSearchParams } from 'react-router'
import { toaster } from '~/components/ui/toaster'
import { TEXT_QUERY_KEY } from '~/lib/constants'

export default function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [textQuery, setTextQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const updateSearchParamQuery = (query: string) => {
    setSearchParams((searchParams) => {
      if (query) {
        searchParams.set(TEXT_QUERY_KEY, query)
      }
      else {
        searchParams.delete(TEXT_QUERY_KEY)
      }
      return searchParams
    })
  }

  // Search
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })
  const search = async (query = '') => {
    try {
      await fetcher.load(`/api/search?${TEXT_QUERY_KEY}=${query}`)
      updateSearchParamQuery(query)
    }
    catch (error) {
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
      })
    }
  }

  // Clear button
  const endElement = textQuery
    ? (
        <CloseButton
          size="md"
          onClick={() => {
            setTextQuery('')
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

  useEffect(() => {
    const query = searchParams.get(TEXT_QUERY_KEY) ?? ''
    if (query) {
      setTextQuery(query)
    }
    // Initial search
    search(query)
  }, [])

  return (
    <HStack>
      <InputGroup startElement={fetcher.state === 'loading' ? <Spinner /> : <LuSearch size="22" />} endElement={endElement}>
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
        />
      </InputGroup>
      <Button onClick={() => search(textQuery ?? '')} size="xl" bg="bg.subtle" variant="outline" disabled={fetcher.state === 'loading'}>
        Submit
      </Button>
    </HStack>
  )
}
