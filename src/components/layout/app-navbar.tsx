"use client";

import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBell,
  IconFlaskFilled,
  IconHeartFilled,
  IconMessageCircleFilled,
  IconMessageFilled,
  IconUser,
  IconUserFilled,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";

const navigation = [
  { href: "/home", icon: IconFlaskFilled, label: "Home" },
  { href: "/profile", icon: IconUser, label: "Profile" },
  { href: "/chat", icon: IconMessageFilled, label: "Chat" },
  { href: "/notifications", icon: IconBell, label: "Notifications" },
];

//Stuff for notif types
type NavbarNotificationType = "like" | "comment" | "message" | "group_invite";

type NavbarNotification = {
  id: string;
  actor: string;
  message: string;
  timestamp: string;
  type: NavbarNotificationType;
};

//Static notifs for testing dropdown
const recentNotifications: NavbarNotification[] = [
  {
    id: "n1",
    actor: "Colton Santiago",
    message: "liked your post.",
    timestamp: "2m ago",
    type: "like",
  },
  {
    id: "n2",
    actor: "Liam",
    message: "commented on your post.",
    timestamp: "14m ago",
    type: "comment",
  },
  {
    id: "n3",
    actor: "Chris",
    message: "sent you a message.",
    timestamp: "1h ago",
    type: "message",
  },
  {
    id: "n4",
    actor: "Big Group",
    message: "invited you to join their group.",
    timestamp: "3h ago",
    type: "group_invite",
  },
];

function notificationIcon(type: NavbarNotificationType) {
  switch (type) {
    case "like":
      return IconHeartFilled;
    case "comment":
      return IconMessageCircleFilled;
    case "message":
      return IconMessageFilled;
    case "group_invite":
      return IconUserFilled;
    default:
      return IconBell;
  }
}

//Likes stay red else use navy 
function notificationIconColor(type: NavbarNotificationType) {
  return type === "like"
    ? "var(--mantine-color-red-6)"
    : "var(--mantine-color-navy-7)";
}

function NotificationsDropdown({ active, showLabel }: { active: boolean; showLabel: boolean }) {
  //Local UI state for preview dismiss, wire this to backend notifications later.
  const [notifications, setNotifications] = useState(recentNotifications);
  const visibleNotifications = notifications.slice(0, 5);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  return (
    <Menu shadow="md" width={360} position="bottom" offset={8} zIndex={999999999}>
      <Menu.Target>
        <Button
          variant="transparent"
          leftSection={<IconBell size={28} />}
          size="lg"
          c={active ? "gray.0" : "navy.5"}
          style={{ transition: "color 0.2s", whiteSpace: "nowrap" }}
        >
          {showLabel && "Notifications"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack gap={8} p={8}>
          <Text fw={700} size="sm" ta="center">
            Recent notifications
          </Text>
          {visibleNotifications.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center">
              No notifications.
            </Text>
          ) : (
            visibleNotifications.map((notification) => {
              const NotificationIcon = notificationIcon(notification.type);

              return (
                <Group
                  key={notification.id}
                  justify="space-between"
                  align="flex-start"
                  wrap="nowrap"
                >
                  <Group align="flex-start" wrap="nowrap" gap={8}>
                    <NotificationIcon
                      size={18}
                      color={notificationIconColor(notification.type)}
                    />
                    <Box>
                      <Text size="sm">
                        <Text span fw={600}>
                          {notification.actor}
                        </Text>{" "}
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {notification.timestamp}
                      </Text>
                    </Box>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label="Dismiss notification"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              );
            })
          )}
        </Stack>
        <Divider my={4} />
        <Box p={8}>
          <Button
            component={Link}
            href="/notifications"
            fullWidth
            variant="filled"
            bg="navy.7"
            c="white"
          >
            View all
          </Button>
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}

const NAVBAR_COLLAPSED = 75;
const NAVBAR_EXPANDED = 194;

export function AppNavbar({ userId }: { userId: string }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

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

  const showLabels = isMobile ? false : hovered;

  return (
    <Flex
      bg="navy.7"
      pos="fixed"
      w={isMobile ? "100%" : hovered ? NAVBAR_EXPANDED : NAVBAR_COLLAPSED}
      h={isMobile ? 60 : "100%"}
      direction={isMobile ? "row" : "column"}
      justify="center"
      align={isMobile ? "center" : "flex-start"}
      gap={16}
      {...(isMobile && { bottom: 0 })}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        zIndex: 99999999,
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {navigation.map((item) => {
        const active = isActive(item);
        const href = getHref(item);

        //Desktop notifications open a dropdown, mobile goes to /notifications
        if (!isMobile && item.href === "/notifications") {
          return (
            <Box key={item.href}>
              <NotificationsDropdown active={active} showLabel={showLabels} />
            </Box>
          );
        }

        const disabled = active;

        return disabled ? (
          <Button
            key={item.href}
            variant="transparent"
            leftSection={<item.icon size={28} />}
            size="lg"
            c={active ? "gray.0" : "navy.5"}
            style={{ transition: "color 0.2s", pointerEvents: "none", whiteSpace: "nowrap" }}
          >
            {showLabels && item.label}
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
            style={{ transition: "color 0.2s", whiteSpace: "nowrap" }}
          >
            {showLabels && item.label}
          </Button>
        );
      })}
    </Flex >
  );
}
