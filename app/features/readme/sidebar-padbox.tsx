import type { BoxProps } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'

export default function SidebarPadBox({ children, ...props }: BoxProps) {
  return (
    <Box px={[4, 8]} py={4} {...props}>
      {children}
    </Box>
  )
}
