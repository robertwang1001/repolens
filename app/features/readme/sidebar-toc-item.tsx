import type { TocItem } from '~/lib/build-toc'
import { Link } from '@chakra-ui/react'
import { memo, useEffect, useRef } from 'react'
import { Link as ReactRouterLink } from 'react-router'

export interface SidebarTocItemProps extends TocItem {
  isActive?: boolean
}

const SidebarTocItem = memo(({ depth, id, text, isActive }: SidebarTocItemProps) => {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isActive])

  return (
    <Link
      asChild
      ref={ref}
      w="full"
      pl={2 + 4 * depth}
      pr={2}
      py={1.5}
      outline="none"
      color="fg.muted"
      textDecoration="none"
      data-current={isActive ? true : undefined}
      aria-current={isActive ? true : undefined}
      _current={{
        color: 'fg',
        bgColor: 'bg.muted',
      }}
      _hover={{
        bgColor: 'bg.muted',
      }}
    >
      <ReactRouterLink to={`#${id}`} replace>
        {text}
      </ReactRouterLink>
    </Link>
  )
})

export default SidebarTocItem
