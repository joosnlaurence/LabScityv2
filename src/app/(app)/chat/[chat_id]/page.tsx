"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Indicator,
  Loader,
  Modal,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle, IconPlus, IconSend } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import {
  useCreateChat,
  useGetChatsWithPreview,
  useGetOldMessages,
  useLeaveConversation,
  useUpdateConversationName,
} from "@/components/chat/use-chat";
import {
  type ChatPreview,
  getOldMessages,
  markConversationAsRead,
} from "@/lib/actions/chat";
import { searchForUsers } from "@/lib/actions/data";
import type { User } from "@/lib/types/feed";
import { createClient } from "@/supabase/client";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

const ChatNavLink = memo(function ChatNavLink({
  chat,
  isActive,
}: {
  chat: ChatPreview;
  isActive: boolean;
}) {
  return (
    <NavLink
      href={`/chat/${chat.conversation_id}`}
      active={isActive}
      styles={{
        root: { "--nav-active-bg": "var(--mantine-color-navy-3)" },
      }}
      c="navy.7"
      px="md"
      py="sm"
      label={
        <Text fw={600}>{chat.name || `Chat #${chat.conversation_id}`}</Text>
      }
      description={
        <Text size="xs" c="dimmed">
          {chat.message?.content || "No messages yet"}
        </Text>
      }
      leftSection={<Avatar radius="xl" size="md" color="navy.7" bg="navy.7" />}
      rightSection={
        (chat.unread_count ?? 0) > 0 ? (
          <Badge size="sm" color="blue" variant="filled">
            {(chat.unread_count ?? 0) > 99 ? "99+" : chat.unread_count}
          </Badge>
        ) : null
      }
    />
  );
});

const MessageBubble = memo(function MessageBubble({
  msg,
  isMe,
}: {
  msg: Message;
  isMe: boolean;
}) {
  return (
    <Group justify={isMe ? "flex-end" : "flex-start"} align="flex-end" gap="xs">
      {!isMe && <Avatar radius="xl" size="md" color="navy.7" bg="navy.7" />}
      <Paper
        p="sm"
        px="md"
        radius="lg"
        bg={isMe ? "gray.6" : "navy.3"}
        c={isMe ? "navy.0" : "navy.7"}
        shadow="sm"
        style={{ maxWidth: "70%" }}
      >
        <Text size="sm">{msg.content}</Text>
      </Paper>
    </Group>
  );
});

export default function ChatPage() {
  const [supabase] = useState(() => createClient());
  const { chat_id } = useParams<{ chat_id: string }>();
  const router = useRouter();

  // -- STATE --
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [optimisticIds, setOptimisticIds] = useState<Set<number>>(new Set());

  // -- CHATS SIDEBAR QUERY --
  const { data: chatsData } = useGetChatsWithPreview();

  // -- PAGINATION STATE --
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // -- MODAL STATE --
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  // -- RENAME STATE --
  const [chatName, setChatName] = useState("");

  // Search state
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // -- NEW CHAT MUTATION --
  const createChatMutation = useCreateChat();

  // -- LEAVE CHAT MUTATION --
  const leaveConversationMutation = useLeaveConversation();

  // -- RENAME CHAT MUTATION --
  const updateConversationNameMutation = useUpdateConversationName();

  // -- REFS --
  const viewport = useRef<HTMLDivElement>(null);
  // We use this to tell the UI *why* the messages array changed
  const scrollReason = useRef<"init" | "new_message" | "pagination">("init");
  // Track optimistic message IDs to avoid stale closure in realtime handler
  const optimisticIdsRef = useRef<Set<number>>(new Set());

  // NOTE: debounced runs automatically after 300ms when query is been updated
  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    // NOTE: debounced is the search query
    // searchForUsers returns User[] - User is defined in types/feed.ts
    searchForUsers({ query: debounced }).then((res) => {
      setResults(res.success ? (res.data ?? []) : []);
      setSearching(false);
    });
  }, [debounced]);

  // 0. CLEAR MESSAGES ON CHAT SWITCH
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
  }, [chat_id]);

  // 1. FETCH USER
  useEffect(() => {
    if (!chat_id) return;

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };

    fetchUser();
  }, [chat_id, supabase]);

  // 2. FETCH MESSAGES WITH REACT QUERY
  const { data: messagesResult } = useGetOldMessages(
    chat_id ? parseInt(chat_id) : 0,
  );

  useEffect(() => {
    if (messagesResult?.success && messagesResult.data) {
      scrollReason.current = "init";
      setMessages(messagesResult.data);
      setHasMore(messagesResult.data.length >= 50);
      if (chat_id) {
        markConversationAsRead(parseInt(chat_id));
      }
    }
  }, [messagesResult, chat_id]);

  // 3. REALTIME
  useEffect(() => {
    if (!chat_id || !supabase) return;

    const uniqueChannelName = `room:${chat_id}-${Date.now()}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat_id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((current) => {
            const optimisticIdToRemove = Array.from(
              optimisticIdsRef.current,
            ).find((id) => {
              const optimisticMsg = current.find((m) => m.id === id);
              return (
                optimisticMsg &&
                optimisticMsg.content === newMessage.content &&
                optimisticMsg.sender_id === newMessage.sender_id
              );
            });

            if (optimisticIdToRemove) {
              optimisticIdsRef.current.delete(optimisticIdToRemove);
              setOptimisticIds((current) => {
                const next = new Set(current);
                next.delete(optimisticIdToRemove);
                return next;
              });
              return current
                .filter((m) => m.id !== optimisticIdToRemove)
                .concat(newMessage);
            }

            return [...current, newMessage];
          });

          scrollReason.current = "new_message"; // Tell UI to snap to bottom
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") setIsConnected(true);
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [chat_id, supabase]);

  // 4. SMART SCROLLING
  useEffect(() => {
    if (!viewport.current) return;

    if (
      scrollReason.current === "init" ||
      scrollReason.current === "new_message"
    ) {
      // Smoothly scroll to the very bottom
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
    // If reason is 'pagination', do absolutely nothing. We handle that in loadMore.
  }, [messages]);

  // 5. LOAD MORE (PAGINATION)
  const loadMore = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0 || !chat_id) return;

    setIsLoadingMore(true);
    scrollReason.current = "pagination"; // Stop the auto-scroller from firing

    // The cursor is the timestamp of the oldest message we currently see
    const oldestMessageTimestamp = messages[0].created_at;
    const oldScrollHeight = viewport.current?.scrollHeight || 0;

    const response = await getOldMessages(
      parseInt(chat_id),
      oldestMessageTimestamp,
    );

    if (response.success && response.data) {
      if (response.data.length < 50) setHasMore(false);

      // Prepend old messages
      setMessages((current) => [...response.data!, ...current]);

      // The Magic Scroll Fix: Keep the scrollbar perfectly still
      setTimeout(() => {
        if (viewport.current) {
          const newScrollHeight = viewport.current.scrollHeight;
          viewport.current.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }, 0);
    }

    setIsLoadingMore(false);
  };

  // 6. HANDLERS
  const handleSend = async () => {
    if (!inputText.trim() || !userId || !chat_id) return;

    const textToSend = inputText;
    setInputText("");

    const optimisticMessage: Message = {
      id: Date.now(),
      conversation_id: parseInt(chat_id),
      sender_id: userId,
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setOptimisticIds((current) => new Set(current).add(optimisticMessage.id));
    optimisticIdsRef.current.add(optimisticMessage.id);

    const { error } = await supabase.from("messages").insert({
      conversation_id: parseInt(chat_id),
      sender_id: userId,
      content: textToSend,
    });

    if (error) {
      console.error("Error sending:", error);
      setMessages((current) =>
        current.filter((m) => m.id !== optimisticMessage.id),
      );
      setOptimisticIds((current) => {
        const next = new Set(current);
        next.delete(optimisticMessage.id);
        return next;
      });
      optimisticIdsRef.current.delete(optimisticMessage.id);
      notifications.show({
        title: "Failed to send message",
        message: "Please try again",
        color: "red",
      });
      setInputText(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // NOTE: This takes in an arry of user_id's
  const handleCreateChat = () => {
    if (!query.trim()) return;
    // searchQuery is the user ID to invite — replace with real user lookup later
    createChatMutation.mutate([query.trim()], {
      onSuccess: () => {
        setNewChatModalOpen(false);
        setQuery("");
      },
    });
  };

  if (!chat_id)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );

  return (
    <Group
      align="stretch"
      gap={0}
      h="calc(100vh - 60px)"
      bg="gray.3"
      style={{ overflow: "hidden" }}
    >
      {/* SIDEBAR */}
      <Box w={320} p="md" bg="gray.3" style={{ flexShrink: 0, height: "100%" }}>
        <Paper
          radius="lg"
          shadow="sm"
          h="100%"
          withBorder
          bg="gray.2"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            p="md"
            pb="sm"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Title order={3} c="navy.7" ta="center">
              My Conversations
            </Title>
          </Box>

          <ScrollArea flex={1}>
            {chatsData === undefined ? (
              <Center p="xl">
                <Loader size="sm" />
              </Center>
            ) : !chatsData?.data || chatsData.data.length === 0 ? (
              <Center p="xl">
                <Text c="dimmed">No chats found.</Text>
              </Center>
            ) : (
              chatsData.data.map((chat) => (
                <ChatNavLink
                  key={chat.conversation_id}
                  chat={chat}
                  isActive={chat.conversation_id + "" === chat_id}
                />
              ))
            )}
          </ScrollArea>

          {/* NEW CHAT BUTTON */}
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

      {/* NEW CHAT MODAL */}
      <Modal
        opened={newChatModalOpen}
        onClose={() => {
          setNewChatModalOpen(false);
          setQuery("");
          setSelectedUsers([]);
        }}
        title={
          <Title order={4} c="navy.7">
            New Conversation
          </Title>
        }
        centered
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search by name"
            value={query}
            // NOTE: the search function is called every 300ms after the query is set so you don't really have to do much here to get it to work
            onChange={(e) => setQuery(e.target.value)}
            radius="xl"
            size="md"
          />
          {searching && (
            <Center>
              <Loader size="sm" />
            </Center>
          )}
          {results.length > 0 && (
            <Stack gap={0}>
              {results.map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u.user_id === user.user_id,
                );
                return (
                  <NavLink
                    key={user.user_id}
                    label={
                      <Text fw={600} c="navy.7">
                        {user.first_name} {user.last_name}
                      </Text>
                    }
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
                    styles={{
                      root: {
                        "--nav-active-bg": "var(--mantine-color-navy-3)",
                      },
                    }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedUsers((current) =>
                          current.filter((u) => u.user_id !== user.user_id),
                        );
                      } else {
                        setSelectedUsers((current) => [...current, user]);
                      }
                    }}
                    style={{ borderRadius: 8 }}
                  />
                );
              })}
            </Stack>
          )}
          {query.trim() && !searching && results.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">
              No users found
            </Text>
          )}
          <Button
            fullWidth
            color="navy.7"
            variant="filled"
            radius="xl"
            loading={createChatMutation.isPending}
            disabled={selectedUsers.length === 0}
            onClick={() =>
              createChatMutation.mutate(
                selectedUsers.map((u) => u.user_id),
                {
                  onSuccess: () => {
                    setNewChatModalOpen(false);
                    setQuery("");
                    setSelectedUsers([]);
                  },
                },
              )
            }
          >
            Start Chat
          </Button>
        </Stack>
      </Modal>

      {/* MAIN CHAT */}
      <Box style={{ flex: 1, overflow: "hidden" }}>
        <Container fluid h="calc(100vh - 60px)" p={0}>
          <Stack h="100%" gap={0} bg="gray.1">
            {/* HEADER */}
            <Paper
              p="md"
              shadow="sm"
              radius="lg"
              withBorder
              bg="gray.2"
              style={{ zIndex: 10 }}
            >
              <Group justify="space-between" align="center">
                <Box w={36} />
                <Stack gap={4} align="center">
                  <Title order={3} c="navy.7" style={{ margin: 0 }}>
                    {chatsData?.data?.find(
                      (c) => c.conversation_id + "" === chat_id,
                    )?.name || `Chat #${chat_id}`}
                  </Title>
                  <Group align="center" style={{ gap: 6 }}>
                    <Indicator
                      color={isConnected ? "green" : "yellow"}
                      size={8}
                      processing
                    />
                    <Text size="xs" c="dimmed">
                      {isConnected ? "Live" : "Connecting..."}
                    </Text>
                  </Group>
                </Stack>
                <ActionIcon
                  variant="subtle"
                  color="navy.7"
                  radius="xl"
                  size="xl"
                  onClick={() => setInfoModalOpen(true)}
                >
                  <IconInfoCircle size="1.6rem" />
                </ActionIcon>
              </Group>
            </Paper>

            {/* INFO MODAL */}
            <Modal
              opened={infoModalOpen}
              onClose={() => setInfoModalOpen(false)}
              title={
                <Title order={4} c="navy.7">
                  {chatsData?.data?.find(
                    (c) => c.conversation_id + "" === chat_id,
                  )?.name || `Chat #${chat_id}`}
                </Title>
              }
              centered
            >
              <Stack gap="md">
                {messages.length > 0 && (
                  <Text size="sm" c="navy.7">
                    <Text span fw={600}>
                      Conversation started:{" "}
                    </Text>
                    {new Date(messages[0].created_at).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </Text>
                )}

                <Box>
                  <Text size="sm" fw={600} c="navy.7" mb={6}>
                    Members
                  </Text>
                  <Text size="sm" c="dimmed">
                    Coming soon
                  </Text>
                </Box>

                {/* Update Chat Name */}
                <Box>
                  <Text size="sm" fw={600} c="navy.7" mb={6}>
                    Update Chat Name
                  </Text>
                  <Group gap="xs">
                    <TextInput
                      placeholder="Enter a new name..."
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      radius="xl"
                      size="sm"
                      style={{ flex: 1 }}
                    />
                    <Button
                      color="navy.7"
                      variant="filled"
                      radius="xl"
                      size="sm"
                      disabled={!chatName.trim()}
                      loading={updateConversationNameMutation.isPending}
                      onClick={() =>
                        updateConversationNameMutation.mutate(
                          { id: parseInt(chat_id), newName: chatName.trim() },
                          {
                            onSuccess: () => {
                              setChatName("");
                            },
                          },
                        )
                      }
                    >
                      Save
                    </Button>
                  </Group>
                </Box>

                <Button
                  fullWidth
                  color="red"
                  variant="light"
                  radius="xl"
                  loading={leaveConversationMutation.isPending}
                  onClick={() =>
                    leaveConversationMutation.mutate(parseInt(chat_id), {
                      onSuccess: () => {
                        setInfoModalOpen(false);
                        router.push("/chat");
                      },
                    })
                  }
                >
                  Leave Chat
                </Button>
              </Stack>
            </Modal>

            {/* MESSAGES */}
            <ScrollArea flex={1} p="md" viewportRef={viewport}>
              <Stack gap="md">
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
                    <Text c="dimmed" size="sm">
                      No messages yet. Say hello!
                    </Text>
                  </Center>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return <MessageBubble key={msg.id} msg={msg} isMe={isMe} />;
                })}
              </Stack>
            </ScrollArea>

            {/* INPUT */}
            <Paper p="md" withBorder radius="md" bg="gray.2">
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
                  color="navy.7"
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
      </Box>
    </Group>
  );
}
