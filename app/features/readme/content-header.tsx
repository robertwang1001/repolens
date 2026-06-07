import { Box, Button, Heading, HStack, Link } from '@chakra-ui/react'
import { useCallback } from 'react'
import { FaAlignLeft, FaArrowLeft } from 'react-icons/fa'
import { LuExternalLink } from 'react-icons/lu'
import { useNavigate } from 'react-router'
import DrawerSidebar from './drawer-sidebar'

function OwnerRepo({ owner, repo }: { owner: string, repo: string }) {
  return (
    <Heading size="xl" truncate>
      {owner}
      /
      {repo}
    </Heading>
  )
}

export default function ContentHeader({ owner, repo, repoUrl }: {
  owner: string
  repo: string
  repoUrl?: string
}) {
  const navigate = useNavigate()
  const navigateBackword = useCallback(() => navigate(-1), [])
  return (
    <HStack bg="bg" py={[2, 4]} justifyContent="space-between">
      <DrawerSidebar>
        <Button size="sm" hideFrom="md" variant="ghost">
          <FaAlignLeft />
        </Button>
      </DrawerSidebar>
      <Button size={['sm', 'lg']} hideBelow="md" variant="outline" onClick={navigateBackword}>
        <FaArrowLeft />
        Back
      </Button>
      {
        repoUrl
          ? (
              <Link href={repoUrl} target="_blank" rel="noopener noreferrer" maxW="full">
                <OwnerRepo owner={owner} repo={repo} />
                <Box flexShrink={0} color="fg.muted">
                  <LuExternalLink />
                </Box>
              </Link>
            )
          : <OwnerRepo owner={owner} repo={repo} />
      }
    </HStack>
  )
}
