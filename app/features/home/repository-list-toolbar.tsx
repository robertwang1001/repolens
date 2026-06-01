import type { RepoSearchPageResult } from '~/types/repo-search'
import { Em, HStack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useFetcher, useSearchParams } from 'react-router'
import { TEXT_QUERY_KEY } from '~/lib/constants'
import { formatCompactNumber } from '~/lib/formatCompactNumber'

export default function RepositoryListToolbar() {
  const [searchParams] = useSearchParams()
  const fetcher = useFetcher<RepoSearchPageResult>({ key: 'search' })
  const count = useMemo(() => formatCompactNumber(fetcher.data?.repositoryCount ?? 0), [fetcher.data?.repositoryCount])

  return (
    <HStack>
      {searchParams.get(TEXT_QUERY_KEY)
        ? (
            <Text color="fg.muted">
              {count}
              {' '}
              results for:
              {' '}
              <Em>{searchParams.get(TEXT_QUERY_KEY)}</Em>
            </Text>
          )
        : <Text color="fg.muted">Most starred repositories</Text>}
    </HStack>
  )
}
