import { Spinner, VStack } from '@chakra-ui/react'

export default function ContentSpinner({ text }: { text?: string }) {
  return (
    <VStack gap={2} color="fg.muted" fontSize="md">
      <Spinner size="lg" />
      { text }
    </VStack>
  )
}
