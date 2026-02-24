"use client"

import { Button, Menu } from "@mantine/core"
import { IconLogout, IconSettings } from "@tabler/icons-react"

const LSAppTopBar = () => {
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
          leftSection={<IconLogout size={14} />}>
          Log Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default LSAppTopBar
