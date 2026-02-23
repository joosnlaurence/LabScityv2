"use client";

import { Box, Button, Group } from "@mantine/core";
import { IconFlaskFilled, IconMessageFilled, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/app/use-is-mobile";

const navigation = [
  { href: "/home", icon: IconFlaskFilled, label: "Home" },
  { href: "/profile", icon: IconUser, label: "Profile" },
  { href: "/chat", icon: IconMessageFilled, label: "Chat" },
];

export function AppNavbar({ userId }: { userId: string }) {
  const isMobile = useIsMobile()
  const pathname = usePathname()

  function getHref(item: (typeof navigation)[number]): string {
    if (item.href === "/profile") {
      return `/profile/${userId}`;
    }
    return item.href;
  }

  function isActive(item: (typeof navigation)[number]) {
    if (item.href === "/profile") {
      return pathname.startsWith("/profile");
    }
    return pathname === item.href;
  }

  return (
    <Box
      h={60}
      bg="navy.7"
      pos="fixed"
      w="100%"
      {...isMobile && { bottom: 0 }} // switch between top/bottom
      style={{
        zIndex: 99999999 // THIS NEEDS TO BE HUGE! should stay atop everythin
      }}
    >

      <Group h="100%" justify={isMobile ? "center" : "flex-start"} align="center">
        {navigation.map((item) => {
          const active = isActive(item);
          const href = getHref(item);
          const disabled = active;

          // NOTE: we disable the button for the current link we are on
          // we do this by removing its href
          // this is probably a shit way to do this but again works for now :)

          return disabled ? (
            <Button
              key={item.href}
              variant="transparent"
              leftSection={<item.icon size={28} />}
              size="lg"
              c={active ? "gray.0" : "navy.5"}
              style={{ transition: "color 0.2s", pointerEvents: "none" }}
            >
              {!isMobile && item.label} {/* only show label on desktop */}
            </Button>
          ) : (
            <Button
              key={item.href}
              href={href}
              component={Link}
              variant="transparent"
              leftSection={<item.icon size={28} />}
              size="lg"
              c="navy.5"
              style={{ transition: "color 0.2s" }}
            >
              {!isMobile && item.label}
            </Button>
          )
        })}
      </Group>

    </Box >
  );
}
