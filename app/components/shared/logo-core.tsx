import { Avatar } from '@chakra-ui/react'
import { memo } from 'react'

const LogoCore = memo(({ logoUrl }: { logoUrl: string }) => {
  return (
    <Avatar.Root shape="square" size={['sm', 'lg']} bgColor="transparent">
      <Avatar.Image src={logoUrl} />
    </Avatar.Root>
  )
})

export default LogoCore
