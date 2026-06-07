import { ClientOnly, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import LogoLinkable from '~/components/shared/logo-linkable'
import { ColorModeButton } from '~/components/ui/color-mode'
import { APP_VERSION } from '~/lib/constants'
import PadBox from './sidebar-padbox'
import SidebarToc from './sidebar-toc'

export default function Sidebar() {
  return (
    <Stack h="full">
      <PadBox>
        <LogoLinkable showTitle />
      </PadBox>
      <PadBox flexGrow={1} minH={0} overflowY="scroll">
        <ClientOnly fallback={<Spinner />}>
          <SidebarToc />
        </ClientOnly>
      </PadBox>
      <PadBox>
        <HStack justifyContent="space-between">
          <Text color="fg.subtle">
            v
            {APP_VERSION}
          </Text>
          <ColorModeButton />
        </HStack>
      </PadBox>
    </Stack>
  )
}
