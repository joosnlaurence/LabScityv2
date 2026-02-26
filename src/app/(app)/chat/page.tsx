// app/chat/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server' // Use your server-side Supabase client
import { Container, Center, Text, Stack } from '@mantine/core'
import { IconMessageCircleOff } from '@tabler/icons-react'

export default async function ChatIndexPage() {

  const supabase = createClient()

  // 2. Query the View we made earlier for their most recent chat
  const query = (await supabase)
    .from('chat_sidebar')
    .select('conversation_id')
    .order('last_message_at', { ascending: false, nullsFirst: false }) // Newest first
    .limit(1)
    .maybeSingle();

  const recentChat = (await query)

  if (recentChat.data) {
    const chat_id = recentChat.data.conversation_id
    redirect(`/chat/${chat_id}`)
  }

  // 4. If they have NO chats, render a friendly "Empty State" UI
  return (
    <Container h="100vh" fluid p={0}>
      <Center h="100%" bg="gray.0">
        <Stack align="center" gap="xs">
          <IconMessageCircleOff size="3rem" color="gray" />
          <Text size="lg" fw={500} c="dimmed">No conversations yet</Text>
          <Text size="sm" c="dimmed">Select a user to start chatting!</Text>
        </Stack>
      </Center>
    </Container>
  )
}
