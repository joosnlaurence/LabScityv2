"use client"

import { Button, Menu, Image, Flex } from "@mantine/core"
import { IconLogout, IconSettings } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/supabase/client"
import { useIsMobile } from "../use-is-mobile"

const LSAppTopBar = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient() // TODO: why dont we pass down the client?

    await supabase.auth.signOut() // call signout

    router.push("/login") // go to login screen
  }

  const isMobile = useIsMobile()

  return (
    <Flex
      pos="sticky"
      bg="gray.0"
      top={0}
      left={isMobile ? 0 : 60}
      h={60}
      w={"100%"}
      justify="center"
      align="center"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-3)", zIndex: 100 }}
    >
      <Image src="/logo.png" w="auto" h="64%" />
      <Menu>
        <Menu.Target>
          <Button
            variant="transparent"
            c="navy.7"
            size="compact-md"
            leftSection={<IconSettings />}
            pos="absolute"
            right={0}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label c="navy.6">Options</Menu.Label>

          <Menu.Item
            c="red"
            leftSection={<IconLogout size={14} />}
            onClick={handleSignOut}>
            Sign Out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Flex>
  )
}

export default LSAppTopBar
