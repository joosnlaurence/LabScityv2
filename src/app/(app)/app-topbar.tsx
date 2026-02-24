"use client"

import { Button, Menu } from "@mantine/core"
import { IconLogout, IconSettings } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/supabase/client"

const LSAppTopBar = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient() // TODO: why dont we pass down the client?

    await supabase.auth.signOut() // call signout

    router.push("/login") // go to login screen
  }

  return (
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
  )
}

export default LSAppTopBar
