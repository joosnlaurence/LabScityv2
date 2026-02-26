"use client"

import { Box, Flex, Space } from "@mantine/core"
import LSAppTopBar from "./app-topbar"
import { useIsMobile } from "../use-is-mobile"

const LSAppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()

  return (
    <Flex direction={isMobile ? "column" : "row"}>
      {/* space to make room for desktop navbar */}
      {!isMobile && <Space w={164} style={{ flexShrink: 0 }} />}

      <Flex direction="column" flex={1} maw={isMobile ? "100%" : "calc(100vw - 60px)"}>
        <LSAppTopBar />

        {/* space to make room for topbar */}
        <Space h={60} />

        <Box>
          {children}
        </Box>

        {/* footer; only needed on mobile */}
        {isMobile && <Space h={60} />}

      </Flex>
    </Flex>
  )
}

export default LSAppLayout
