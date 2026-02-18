"use client";

import { Box, Grid } from "@mantine/core";
import { ChatSidebar } from "@/components/chat/sidebar";

export default function ChatIndexPage() {
  return (
    <Box bg="gray.2" p="md" style={{ minHeight: "100vh" }}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChatSidebar />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Box
            bg="white"
            p="xl"
            style={{
              borderRadius: "8px",
              height: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Select a conversation to start chatting
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
