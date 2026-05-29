import { Avatar } from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'

export default function Logo() {
  const logoUrl = useColorModeValue('/logo.png', '/logo-dark.png')
  return (
    <Avatar.Root shape="square" size={['sm', 'lg']} bgColor="transparent">
      <Avatar.Image src={logoUrl} />
    </Avatar.Root>
  )
}
