"use client";

import { Box, Grid } from "@mantine/core";
import { useParams } from "next/navigation";
import { ChatBox } from "@/components/chat/chatbox";
import { ChatSidebar } from "@/components/chat/sidebar";

export default function ChatPage() {
  const params = useParams();
  const conversationId = Number(params.chat_id);

  return (
    <Box bg="gray.2" p="md" style={{ minHeight: "100vh" }}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChatSidebar />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <ChatBox conversationId={conversationId} />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
