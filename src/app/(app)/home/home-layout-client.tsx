"use client";

import { Box } from "@mantine/core";

export function HomeLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Box mih="100vh" bg="gray.0">
      {children}
    </Box>
  );
}
