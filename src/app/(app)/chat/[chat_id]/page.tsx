'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
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
  Center,
  Container,
  Title,
  Avatar,
  Indicator,
  AppShell,
  NavLink,
  Button
} from '@mantine/core'
import { IconSend, IconMessageCircle2 } from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { ChatPreview, getChatsWithPreview, getOldMessages } from '@/lib/actions/chat'

interface Message {
  id: number
  conversation_id: number
  sender_id: string
  content: string
  created_at: string
}

export default function ChatPage() {
  const [supabase] = useState(() => createClient())
  const { chat_id } = useParams<{ chat_id: string }>()

  // -- STATE --
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [inputText, setInputText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatPreview[]>([])

  // -- PAGINATION STATE --
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // -- REFS --
  const viewport = useRef<HTMLDivElement>(null)
  // We use this to tell the UI *why* the messages array changed
  const scrollReason = useRef<'init' | 'new_message' | 'pagination'>('init')

  // 1. INIT DATA
  useEffect(() => {
    if (!chat_id) return

    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      if (!user) return;

      try {
        scrollReason.current = 'init' // Tell the UI to scroll to bottom on load

        // Ensure your getOldMessages server action is updated to accept a cursor!
        const data = await getOldMessages(parseInt(chat_id))

        if (!data.data) return;

        if (data.data.length < 50) setHasMore(false) // Assuming limit is 50
        setMessages(data.data)

      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    initData()
  }, [chat_id, supabase])

  // 2. INIT SIDEBAR
  useEffect(() => {
    const initSideBar = async () => {
      try {
        const sidebarData = await getChatsWithPreview();
        if (!sidebarData.data) return;
        setChats(sidebarData.data)
      } catch (error) {
        console.error("issue getting chat preview: ", error);
      }
    }
    initSideBar()
  }, [])

  // 3. REALTIME
  useEffect(() => {
    if (!chat_id || !supabase || !userId) return;

    const uniqueChannelName = `room:${chat_id}-${Date.now()}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chat_id}`,
        },
        (payload) => {
          console.log('Realtime message received:', payload.new);
          const newMessage = payload.new as Message;

          scrollReason.current = 'new_message' // Tell UI to snap to bottom
          setMessages((current) => [...current, newMessage]);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') setIsConnected(true);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [chat_id, supabase, userId]);

  // 4. SMART SCROLLING
  useEffect(() => {
    if (!viewport.current) return;

    if (scrollReason.current === 'init' || scrollReason.current === 'new_message') {
      // Smoothly scroll to the very bottom
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' })
    }
    // If reason is 'pagination', do absolutely nothing. We handle that in loadMore.
  }, [messages])

  // 5. LOAD MORE (PAGINATION)
  const loadMore = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0 || !chat_id) return

    setIsLoadingMore(true)
    scrollReason.current = 'pagination' // Stop the auto-scroller from firing

    // The cursor is the timestamp of the oldest message we currently see
    const oldestMessageTimestamp = messages[0].created_at
    const oldScrollHeight = viewport.current?.scrollHeight || 0

    const response = await getOldMessages(parseInt(chat_id), oldestMessageTimestamp)

    if (response.success && response.data) {
      if (response.data.length < 50) setHasMore(false)

      // Prepend old messages
      setMessages(current => [...response.data!, ...current])

      // The Magic Scroll Fix: Keep the scrollbar perfectly still
      setTimeout(() => {
        if (viewport.current) {
          const newScrollHeight = viewport.current.scrollHeight
          viewport.current.scrollTop = newScrollHeight - oldScrollHeight
        }
      }, 0)
    }

    setIsLoadingMore(false)
  }

  // 6. HANDLERS
  const handleSend = async () => {
    if (!inputText.trim() || !userId || !chat_id) return

    const textToSend = inputText
    setInputText('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: parseInt(chat_id),
      sender_id: userId,
      content: textToSend,
    })

    if (error) {
      console.error('Error sending:', error)
      setInputText(textToSend)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!chat_id) return <Center h="100vh"><Loader /></Center>

  return (
    <AppShell navbar={{ width: 320, breakpoint: 'sm' }} padding={0}>

      {/* SIDEBAR */}
      <AppShell.Navbar bg="gray.1" style={{ borderRight: '1px solid #e9ecef' }}>
        <Paper p="md" radius={0} shadow="xs" style={{ zIndex: 10 }}>
          <Title order={4}>My Conversations</Title>
        </Paper>
        <ScrollArea flex={1}>
          {chats.length === 0 ? (
            <Center p="xl"><Text c="dimmed">No chats found.</Text></Center>
          ) : (
            chats.map((chat) => (
              <NavLink
                key={chat.conversation_id}
                href={`/chat/${chat.conversation_id}`}
                active={chat.conversation_id + "" === chat_id}
                label={<Text fw={600}>{chat.name || `Chat #${chat.conversation_id}`}</Text>}
                description={<Text size="xs"> {chat.message?.content as string || 'No messages yet'}</Text>}
                leftSection={<Avatar radius="xl" size="sm" color="blue" />}
                p="md"
                style={{ borderBottom: '1px solid #e9ecef' }}
              />
            ))
          )}
        </ScrollArea>
      </AppShell.Navbar>

      {/* MAIN CHAT */}
      <AppShell.Main>
        <Container fluid h="100vh" p={0}>
          <Stack h="100%" gap={0} bg="gray.0">

            {/* HEADER */}
            <Paper p="md" shadow="xs" radius={0} withBorder style={{ zIndex: 10 }}>
              <Group justify="space-between">
                <Group>
                  <Avatar color="blue" radius="xl"><IconMessageCircle2 size="1.5rem" /></Avatar>
                  <div>
                    <Title order={5}>Chat Room {chat_id}</Title>
                    <Group gap={6}>
                      <Indicator color={isConnected ? 'green' : 'yellow'} position="middle-start" size={6} processing>
                        <Text size="xs" c="dimmed" ml={10}>
                          {isConnected ? 'Live' : 'Connecting...'}
                        </Text>
                      </Indicator>
                    </Group>
                  </div>
                </Group>
              </Group>
            </Paper>

            {/* MESSAGES */}
            <ScrollArea flex={1} p="md" viewportRef={viewport}>
              <Stack gap="sm">

                {/* PAGINATION BUTTON */}
                {hasMore && messages.length > 0 && (
                  <Center mb="sm">
                    <Button
                      variant="subtle"
                      size="xs"
                      loading={isLoadingMore}
                      onClick={loadMore}
                    >
                      Load older messages
                    </Button>
                  </Center>
                )}

                {messages.length === 0 && (
                  <Center h={200}>
                    <Text c="dimmed" size="sm">No messages yet. Say hello!</Text>
                  </Center>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId
                  return (
                    <Group key={msg.id} justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap="xs">
                      {!isMe && <Avatar radius="xl" size="sm" />}
                      <Paper
                        p="xs"
                        px="md"
                        radius="lg"
                        bg={isMe ? 'blue.6' : 'white'}
                        c={isMe ? 'white' : 'black'}
                        style={{
                          maxWidth: '70%',
                          borderBottomRightRadius: isMe ? 0 : undefined,
                          borderBottomLeftRadius: !isMe ? 0 : undefined
                        }}
                        shadow="xs"
                      >
                        <Text size="sm">{msg.content}</Text>
                      </Paper>
                    </Group>
                  )
                })}
              </Stack>
            </ScrollArea>

            {/* INPUT */}
            <Paper p="md" withBorder radius={0}>
              <Group align="flex-end">
                <TextInput
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1 }}
                  radius="md"
                  size="md"
                  disabled={!isConnected}
                />
                <ActionIcon
                  size="lg"
                  variant="filled"
                  color="blue"
                  radius="xl"
                  onClick={handleSend}
                  disabled={!inputText.trim() || !isConnected}
                >
                  <IconSend size="1.1rem" />
                </ActionIcon>
              </Group>
            </Paper>

          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
