import type { LogoProps } from './logo'
import { Link } from 'react-router'
import Logo from './logo'

export default function LogoLinkable(props: LogoProps) {
  return (
    <Link to="/" aria-label="Home page">
      <Logo {...props} />
    </Link>
  )
}
