import { Button, CloseButton, HStack, Input, InputGroup, Spinner } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useSearch } from '~/hooks/use-search'
import { TEXT_QUERY_KEY } from '~/lib/constants'

export default function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [textQuery, setTextQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const queryFromUrl = useMemo(
    () => searchParams.get(TEXT_QUERY_KEY) ?? '',
    [searchParams],
  )

  const { search, fetcher } = useSearch()
  useEffect(() => {
    search({ textQuery: queryFromUrl })
  }, [queryFromUrl])

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
        { fetcher.state === 'loading' ? <Spinner /> : <LuSearch /> }
        Search
      </Button>
    </HStack>
  )
}
