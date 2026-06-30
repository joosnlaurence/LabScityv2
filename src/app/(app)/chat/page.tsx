// app/chat/page.tsx
import { Center, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconMessageCircle, IconMessages } from "@tabler/icons-react";

export default async function ChatIndexPage() {
  return (
    <Center
      h="100%"
      bg="gray.0"
      style={{
        background: "linear-gradient(180deg, #F8FAFC 0%, #EEF3F9 100%)",
      }}
    >
      <Paper
        radius="xl"
        p="xl"
        withBorder
        bg="white"
        maw={460}
        style={{
          borderColor: "#E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Stack align="center" gap="sm">
          <ThemeIcon
            size={64}
            radius="xl"
            variant="light"
            color="blue"
            style={{ background: "#EFF6FF", color: "#1D4ED8" }}
          >
            <IconMessages size={30} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="#123257">
            Select a conversation
          </Text>
          <Text size="sm" c="#64748B" ta="center">
            Choose a chat from the sidebar to continue a discussion or start a
            new one.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
