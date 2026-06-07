import { CloseButton, Drawer, Portal } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import Sidebar from './sidebar'

export default function DrawerSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const onClick = useCallback<React.MouseEventHandler<HTMLElement>>((e) => {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore
    if (e.target?.nodeName === 'A') {
      setOpen(false)
    }
  }, [])

  return (
    <Drawer.Root placement="start" lazyMount open={open} onOpenChange={e => setOpen(e.open)}>
      <Drawer.Trigger asChild>
        {children}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content onClick={onClick}>
            <Sidebar />
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
