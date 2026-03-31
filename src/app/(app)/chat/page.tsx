// app/chat/page.tsx
import { Center, Stack, Text } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";

export default async function ChatIndexPage() {
  return (
    <Center h="100%" bg="gray.1">
      <Stack align="center" gap="xs">
        <IconMessageCircle size="3rem" color="gray" />
        <Text size="lg" fw={500} c="dimmed">
          Select a chat from the sidebar
        </Text>
        <Text size="sm" c="dimmed">
          Choose a conversation to start messaging
        </Text>
      </Stack>
    </Center>
  );
}
