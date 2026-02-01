"use client";

import { Box, Group, Button, Text, ActionIcon } from "@mantine/core";
import { IconHome, IconSearch, IconUsers, IconMessage, IconBell } from "@tabler/icons-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "Discover", href: "/discover", icon: IconSearch },
  { label: "Groups", href: "/groups", icon: IconUsers },
  { label: "Messages", href: "/messages", icon: IconMessage },
  { label: "Notifications", href: "/notifications", icon: IconBell },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <Box
      h={60}
      px="md"
      bg="gray.1"
      style={{
        position: "sticky",
        top: 0,
        borderBottom:"gray.5",
        zIndex: 100,
      }}
    >
      <Group h="100%" justify="space-between">
        <Box style={{ position: "relative", width: 150, height: 40, flexShrink: 0 }}>
          <Image
            src="/logo.png"
            alt="LabScity logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>

        <Group gap="xl" visibleFrom="sm">
          {navigation.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Text
                key={link.href}
                component={Link}
                href={link.href}
                size="md"
                fw={600}
                c={isActive ? "navy.6" : "navy.8"}
                style={{
                  textDecoration: "none",
                  borderBottom: isActive
                    ? "2px solid var(--mantine-color-navy-6)"
                    : "none",
                  paddingBottom: 4,
                }}
              >
                {link.label}
              </Text>
            );
          })}
        </Group>

        <Group gap="sm" hiddenFrom="sm" justify="center" style={{ flex: 1 }}>
          {navigation.map((link) => {
            const isActive = pathname === link.href;

            return (
              <ActionIcon
                key={link.href}
                component={Link}
                href={link.href}
                size="md"
                variant="subtle"
                c={isActive ? "navy.6" : "navy.8"}
              >
                <link.icon size={22} />
              </ActionIcon>
            );
          })}
        </Group>

        <Button radius="md" color="navy.7" style={{ flexShrink: 0 }}>
          Sign Out
        </Button>
      </Group>
    </Box>
  );
}