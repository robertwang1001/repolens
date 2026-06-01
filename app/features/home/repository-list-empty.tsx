import { EmptyState, VStack } from '@chakra-ui/react'
import { TbMoodEmpty } from 'react-icons/tb'

export default function RepositoryListEmpty() {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>
          <TbMoodEmpty />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>
            No result matches
          </EmptyState.Title>
          <EmptyState.Description>
            Try adjust your search criteria
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}
