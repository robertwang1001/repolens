import { Avatar } from '@chakra-ui/react'

export default function LogoCore({ logoUrl }: { logoUrl: string }) {
  return (
    <Avatar.Root shape="square" size={['sm', 'lg']} bgColor="transparent">
      <Avatar.Image src={logoUrl} />
    </Avatar.Root>
  )
}
