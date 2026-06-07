import { ClientOnly, Heading, HStack, Skeleton } from '@chakra-ui/react'
import { APP_TITLE } from '~/lib/constants'
import LogoClient from './logo-client'

export interface LogoProps {
  showTitle?: boolean
}

export default function Logo({ showTitle }: LogoProps) {
  return (
    <HStack>
      <ClientOnly fallback={<Skeleton boxSize={['36px', '44px']} />}>
        <LogoClient />
      </ClientOnly>
      { showTitle && <Heading as="h1" size={['xl', '3xl']} textWrap="nowrap">{APP_TITLE}</Heading> }
    </HStack>
  )
}
