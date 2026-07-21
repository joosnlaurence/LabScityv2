// app/chat/page.tsx
import { Center, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconMessageCircle, IconMessages } from "@tabler/icons-react";

export default async function ChatIndexPage() {
  return (
    <Center
      h='50%'
      bg="gray.0"
      style={{
        background: "linear-gradient(180deg, #F8FAFC 0%, #EEF3F9 100%)",
      }}
    >
      <Paper
        radius="0"
        p="xl"
        withBorder
        bg="navy.3"
        maw={420}
      >
        <Stack align="center" gap="sm">
          <ThemeIcon
            size={64}
            radius="xl"
            variant="outline"
            color='navy.7'
          >
            <IconMessages size={30} />
          </ThemeIcon>
          <Text size="xl" fw={700}>
            Select a conversation
          </Text>
          <Text size="sm" c="gray.7" ta="center">
            Choose a chat from the sidebar to continue a discussion or start a
            new one.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
