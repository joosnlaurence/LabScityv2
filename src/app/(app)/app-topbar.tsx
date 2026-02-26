"use client"

import { Button, Menu, Image, Flex, Box } from "@mantine/core"
import { IconBell, IconBellFilled, IconLogout, IconSettings, IconSettingsFilled } from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/supabase/client"
import { useIsMobile } from "../use-is-mobile"
import Link from "next/link"
import { useState } from "react"

const LSAppTopBar = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient() // TODO: why dont we pass down the client?

    await supabase.auth.signOut() // call signout

    router.push("/login") // go to login screen
  }

  const isMobile = useIsMobile()

  const pathname = usePathname()
  const inNotificationsPage = pathname.startsWith("/notifications")

  const [settingsOpen, setSettingsOpen] = useState(false)

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
      <Image src="/logo-lightgray.png" w="auto" h="64%" />

      <Flex direction="row" pos="absolute" right={0}>

        {/* notifications link */}
        <Button
          href={"/notifications"}
          component={Link}
          variant="transparent"
          size="compact-sm"

          // fill icons if they are active; also shade them darker 

          leftSection={
            inNotificationsPage ?
              <IconBellFilled /> :
              <IconBell />}
          c={inNotificationsPage ? "gray.7" : "gray.5"}
        />

        {/* settings menu */}
        <Menu opened={settingsOpen} onChange={setSettingsOpen}>
          <Menu.Target>
            <Button
              variant="transparent"
              size="compact-sm"
              c={
                settingsOpen ?
                  "gray.7" :
                  "gray.5"
              }
              leftSection={settingsOpen ?
                <IconSettingsFilled /> :
                <IconSettings />
              }
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
    </Flex >
  )
}

export default LSAppTopBar
