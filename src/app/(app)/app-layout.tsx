"use client"

import LSAppNavbar from "@/components/layout/app-navbar"
import LSAppTopBar from "./app-topbar"
import { Box, Flex, Space } from "@mantine/core"
import { useIsMobile } from "../use-is-mobile"

const LSAppLayout = ({ userId, children }: { userId: string, children: React.ReactNode }) => {
  const isMobile = useIsMobile()

  const mobileNavbarHeight = 60
  const desktopNavbarWidth = 164

  return (
    <Flex direction={isMobile ? "column" : "row"} w="100vw" h="100vh">

      <LSAppNavbar
        userId={userId}
        desktopWidth={desktopNavbarWidth}
        mobileHeight={mobileNavbarHeight}
      />

      {/* needed to make room for navbar; 164 is the navbar size */}
      {!isMobile && <Space w={164} />}
      <Flex direction="column" w="100%">
        <LSAppTopBar />

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
