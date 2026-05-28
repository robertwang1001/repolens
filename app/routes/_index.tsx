import { Stack } from '@chakra-ui/react'

export function meta() {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Home() {
  return (
    <Stack>
      <h1>Welcome to the new React Router app!</h1>
      <p>This is a simple example of how you can use React Router in your Vite project.</p>
    </Stack>
  )
}
