"use client";

import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBell,
  IconHeartFilled,
  IconMessageCircleFilled,
  IconMessageFilled,
  IconUserFilled,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";

type NotificationType = "like" | "comment" | "message" | "group_invite";

type NotificationItem = {
  id: string;
  actor: string;
  type: NotificationType;
  message: string;
  timestamp: string;
};

//Temp removal for now
function dismissNotificationAction(
  id: string,
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>,
) {
  //Need to actually delete the notification upon dismiss
  setNotifications((current) => current.filter((item) => item.id !== id));
}

//Sample stuff for testing
const staticNotifications: NotificationItem[] = [
  {
    id: "n1",
    actor: "Colton Santiago",
    type: "like",
    message: "liked your post: post info",
    timestamp: "2m ago",
  },
  {
    id: "n2",
    actor: "Liam",
    type: "comment",
    message: "commented on your post: COMMENT",
    timestamp: "14m ago",
  },
  {
    id: "n3",
    actor: "Chris",
    type: "message",
    message: "sent you a message: MESSAGE",
    timestamp: "1h ago",
  },
  {
    id: "n4",
    actor: "GROUP NAME",
    type: "group_invite",
    message: "invited you to join their group.",
    timestamp: "3h ago",
  },
  {
    id: "n5",
    actor: "Matt",
    type: "comment",
    message: "commented: COMMENT",
    timestamp: "Yesterday",
  },
];

//Determines what notification icon to use
function notificationIcon(type: NotificationType) {
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

function NotificationCard({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}) {
  const Icon = notificationIcon(item.type);
  const iconColor =
    item.type === "like"
      ? "var(--mantine-color-red-6)"
      : "var(--mantine-color-navy-7)";

  return (
    <Paper withBorder radius="md" p="md" pr={64} pos="relative" bg="white">
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
        pos="absolute"
        top="50%"
        right={10}
        style={{ transform: "translateY(-50%)" }}
      >
        <IconX size={14} />
      </ActionIcon>
      <Group align="flex-start" wrap="nowrap">
        <Icon size={24} color={iconColor} />
        <Stack gap={2}>
          <Text size="sm">
            <Text span fw={600}>
              {item.actor}
            </Text>{" "}
            {item.message}
          </Text>
          <Text size="xs" c="dimmed">
            {item.timestamp}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

//Header tells how many notifications, will need to write real function to determine this
function NotificationsHeader({ totalCount }: { totalCount: number }) {
  return (
    <Stack gap={4} align="center">
      <Text c="dimmed" size="sm" ta="center">
        You have {totalCount} notifications.
      </Text>
    </Stack>
  );
}

const LSNotificationsMobileLayout = () => {
  const [notifications, setNotifications] = useState(staticNotifications);
  const totalCount = notifications.length;

  return (
    <Stack p={8} gap={12}>
      <NotificationsHeader totalCount={totalCount} />
      {notifications.map((item) => (
        <NotificationCard
          key={item.id}
          item={item}
          onDismiss={(id) => dismissNotificationAction(id, setNotifications)}
        />
      ))}
    </Stack>
  );
};

const LSNotificationsDesktopLayout = () => {
  const [notifications, setNotifications] = useState(staticNotifications);
  const totalCount = notifications.length;

  return (
    <Box py={24} px={80}>
      <Flex p={8} direction="row" w="100%" gap={8}>
        <Box flex={5}>
          <NotificationsHeader totalCount={totalCount} />
        </Box>
      </Flex>
      <Divider my={20} color="navy.1" />
      <Stack mt={20} px="20%" gap={12}>
        {notifications.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            onDismiss={(id) => dismissNotificationAction(id, setNotifications)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default function NotificationsPage() {
  const isMobile = useIsMobile();

  return isMobile ? (
    <LSNotificationsMobileLayout />
  ) : (
    <LSNotificationsDesktopLayout />
  );
}
