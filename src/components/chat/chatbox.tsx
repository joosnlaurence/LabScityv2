'use client' // 1. CRITICAL: This must be a Client Component

import { useState, useEffect, useRef } from 'react'
import {
  Paper,
  TextInput,
  ActionIcon,
  ScrollArea,
  Stack,
  Group,
  Text,
  Box,
  Loader,
  Center
} from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import { useChat } from './use-chat' // Import the "Brain" we just made

interface ChatRoomProps {
  conversationId: number
  currentUserId: string // Needed to decide if a message is "Mine" or "Theirs"
}

export function ChatBox({ conversationId, currentUserId }: ChatRoomProps) {
  // 2. Plug in the Brain
  const { messages, loading, isConnected, sendMessage } = useChat(conversationId)

  // Local state for the input box text
  const [inputText, setInputText] = useState('')

  // Reference to the scroll area (so we can auto-scroll)
  const viewport = useRef<HTMLDivElement>(null)

  // 3. Auto-Scroll Effect
  // Every time 'messages' changes, scroll to the bottom
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim()) return
    sendMessage(inputText)
    setInputText('') // Clear the box immediately
  }

  return (
    <Paper shadow="xs" p="md" withBorder h="600px" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* HEADER: Connection Status */}
      <Group justify="space-between" mb="sm" pb="xs" style={{ borderBottom: '1px solid #eee' }}>
        <Text fw={700}>Chat Room #{conversationId}</Text>
        <Group gap={5}>
          <Box
            w={8} h={8}
            style={{ borderRadius: '50%', backgroundColor: isConnected ? 'green' : 'red' }}
          />
          <Text size="xs" c="dimmed">
            {isConnected ? 'Live' : 'Connecting...'}
          </Text>
        </Group>
      </Group>

      {/* BODY: Message List */}
      <ScrollArea style={{ flex: 1 }} viewportRef={viewport} mb="md">
        {loading ? (
          <Center h={200}><Loader size="sm" /></Center>
        ) : (
          <Stack gap="xs">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId

              return (
                <Box
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '70%'
                  }}
                >
                  <Paper
                    p="xs"
                    radius="md"
                    bg={isMe ? 'blue.6' : 'gray.1'}
                    c={isMe ? 'white' : 'black'}
                  >
                    <Text size="sm">{msg.content}</Text>
                  </Paper>
                  <Text size="xs" c="dimmed" ta={isMe ? 'right' : 'left'} mt={2}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Box>
              )
            })}

            {/* Empty state helper */}
            {messages.length === 0 && !loading && (
              <Center mt="xl">
                <Text c="dimmed" size="sm">No messages yet. Say hello!</Text>
              </Center>
            )}
          </Stack>
        )}
      </ScrollArea>

      {/* FOOTER: Input Area */}
      <Group gap="xs">
        <TextInput
          placeholder="Type a message..."
          style={{ flex: 1 }}
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          disabled={!isConnected} // Disable if disconnected
        />
        <ActionIcon
          variant="filled"
          color="blue"
          size="lg"
          onClick={handleSend}
          disabled={!inputText.trim() || !isConnected}
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  )
}
