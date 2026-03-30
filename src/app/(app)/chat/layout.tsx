'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NavLink,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useDebouncedValue } from '@mantine/hooks'
import { getChatsWithPreview, type ChatPreview } from '@/lib/actions/chat'
import { useCreateChat } from '@/components/chat/use-chat'
import { searchForUsers } from '@/lib/actions/data'
import { User } from '@/lib/types/feed'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeChatId = useMemo(() => {
    const match = pathname.match(/^\/chat\/(\d+)/)
    return match?.[1] ?? null
  }, [pathname])

  const [chats, setChats] = useState<ChatPreview[]>([])
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debounced] = useDebouncedValue(query, 300)
  const [results, setResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const createChatMutation = useCreateChat()

  const fetchChats = async () => {
    try {
      const sidebarData = await getChatsWithPreview()
      if (!sidebarData.data) return
      setChats(sidebarData.data)
    } catch (error) {
      console.error('Issue getting chat preview:', error)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      return
    }

    let mounted = true
    setSearching(true)

    searchForUsers({ query: debounced }).then((res) => {
      if (!mounted) return
      setResults(res.success ? (res.data ?? []) : [])
      setSearching(false)
    })

    return () => {
      mounted = false
    }
  }, [debounced])

  return (
    <Group align="stretch" gap={0} h="calc(100vh - 60px)" bg="gray.3" style={{ overflow: 'hidden' }}>
      <Box w={320} p="md" bg="gray.3" style={{ flexShrink: 0, height: '100%' }}>
        <Paper
          radius="lg"
          shadow="sm"
          h="100%"
          withBorder
          bg="gray.2"
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Box p="md" pb="sm" style={{ display: 'flex', justifyContent: 'center' }}>
            <Title order={3} c="navy.7" ta="center">
              My Conversations
            </Title>
          </Box>

          <Box px="md" pb="md">
            <TextInput placeholder="Search" radius="xl" size="md" />
          </Box>

          <Box style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 ? (
              <Center p="xl"><Text c="dimmed">No chats found.</Text></Center>
            ) : (
              chats.map((chat) => (
                <NavLink
                  key={chat.conversation_id}
                  component={Link}
                  href={`/chat/${chat.conversation_id}`}
                  active={chat.conversation_id + '' === activeChatId}
                  styles={{ root: { '--nav-active-bg': 'var(--mantine-color-navy-3)' } }}
                  c="navy.7"
                  px="md"
                  py="sm"
                  label={<Text fw={600}>{chat.name || `Chat #${chat.conversation_id}`}</Text>}
                  description={<Text size="xs" c="dimmed">{chat.message?.content as string || 'No messages yet'}</Text>}
                  leftSection={
                    <Avatar radius="xl" size="md" color="navy.7" bg="navy.7" />
                  }
                  rightSection={
                    (chat.unread_count ?? 0) > 0 ? (
                      <Badge size="sm" color="blue" variant="filled">
                        {(chat.unread_count ?? 0) > 99 ? '99+' : chat.unread_count}
                      </Badge>
                    ) : null
                  }
                />
              ))
            )}
          </Box>

          <Box p="md">
            <Button
              fullWidth
              color="navy.7"
              variant="filled"
              radius="xl"
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setNewChatModalOpen(true)}
            >
              New Chat
            </Button>
          </Box>
        </Paper>
      </Box>

      <Modal
        opened={newChatModalOpen}
        onClose={() => { setNewChatModalOpen(false); setQuery(''); setSelectedUsers([]) }}
        title={<Title order={4} c="navy.7">New Conversation</Title>}
        centered
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            radius="xl"
            size="md"
          />

          {searching && <Center><Loader size="sm" /></Center>}

          {results.length > 0 && (
            <Stack gap={0}>
              {results.map((user) => {
                const isSelected = selectedUsers.some((u) => u.user_id === user.user_id)

                return (
                  <NavLink
                    key={user.user_id}
                    label={<Text fw={600} c="navy.7">{user.first_name} {user.last_name}</Text>}
                    leftSection={
                      <Avatar
                        radius="xl"
                        size="md"
                        color="navy.7"
                        bg="navy.7"
                        src={user.avatar_url}
                      />
                    }
                    active={isSelected}
                    styles={{ root: { '--nav-active-bg': 'var(--mantine-color-navy-3)' } }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedUsers((current) => current.filter((u) => u.user_id !== user.user_id))
                      } else {
                        setSelectedUsers((current) => [...current, user])
                      }
                    }}
                    style={{ borderRadius: 8 }}
                  />
                )
              })}
            </Stack>
          )}

          {query.trim() && !searching && results.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">No users found</Text>
          )}

          <Button
            fullWidth
            color="navy.7"
            variant="filled"
            radius="xl"
            loading={createChatMutation.isPending}
            disabled={selectedUsers.length === 0}
            onClick={() => createChatMutation.mutate(selectedUsers.map((u) => u.user_id), {
              onSuccess: () => {
                setNewChatModalOpen(false)
                setQuery('')
                setSelectedUsers([])
                fetchChats()
              },
            })}
          >
            Start Chat
          </Button>
        </Stack>
      </Modal>

      <Box style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>
    </Group>
  )
}
