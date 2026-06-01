import { useColorModeValue } from '../ui/color-mode'
import LogoCore from './logo-core'

export default function Logo() {
  const logoUrl = useColorModeValue('/logo.png', '/logo-dark.png')
  return (
    <LogoCore logoUrl={logoUrl} />
  )
}
