"use client";

import {
  Button,
  Flex,
} from "@mantine/core";
import {
  IconBell,
  IconFlaskFilled,
  IconMessageFilled,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/app/use-is-mobile";

const navigation = [
  { href: "/home", icon: IconFlaskFilled, label: "Home" },
  { href: "/profile", icon: IconUser, label: "Profile" },
  { href: "/chat", icon: IconMessageFilled, label: "Chat" },
  { href: "/notifications", icon: IconBell, label: "Notifications" },
];

export default function LSAppNavbar({ userId }: { userId: string }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

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

  const mobileNavbarSize = 60
  const desktopNavbarSize = 164

  return (
    <Flex
      bg="navy.7"
      pos="fixed"

      // stretch down screen if desktop ( side ); stretch across if mobile
      w={isMobile ? "100%" : desktopNavbarSize}
      h={isMobile ? mobileNavbarSize : "100%"}

      direction={isMobile ? "row" : "column"}
      align={isMobile ? "center" : "flex-start"}

      justify="center"

      p={8}
      gap={16}

      {...(isMobile && { bottom: 0 })}

      style={{ zIndex: 99999999 }}
    >
      {navigation.map((item) => {
        const active = isActive(item);
        const href = getHref(item);

        return (
          <Button
            key={item.href}
            href={href}
            component={Link}
            leftSection={<item.icon size={28} />}
            c={active ? "gray.0" : "navy.5"}
            variant="transparent"
          >
            {!isMobile && item.label}
          </Button>
        );
      })}
    </Flex>
  );
}
