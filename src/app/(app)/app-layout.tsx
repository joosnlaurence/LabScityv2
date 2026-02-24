"use client"

import { Box, Flex, Space } from "@mantine/core"
import LSAppTopBar from "./app-topbar"
import { useIsMobile } from "../use-is-mobile"

const LSAppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()

  return (
    <Flex direction={isMobile ? "column" : "row"}>
      {!isMobile && <Space w={60} style={{ flexShrink: 0 }} />}
      <Flex direction="column" flex={1} maw={isMobile ? "100%" : "calc(100vw - 60px)"}>
        <LSAppTopBar />
        <Space h={60} />
        <Box>
          {children}
        </Box>
      </Flex>

    </Flex>
  )
}

export default LSAppLayout
