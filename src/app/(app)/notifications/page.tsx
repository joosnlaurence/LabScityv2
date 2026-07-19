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
  IconCircleFilled,
  IconHeartFilled,
  IconMessageCircleFilled,
  IconMessageFilled,
  IconUserFilled,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";
import { LSGroupInviteNotificationCard } from "@/components/notifications/ls-group-invite-notification-card";
import { useMarkNotificationAsRead } from "@/components/notifications/use-notifications";
import { parseGroupIdFromNotificationLink } from "@/lib/utils/group-notification";
import { useNotificationStore } from "@/store/notificationStore";
import { LSNotificationCard } from "@/components/notifications/ls-notification-card";

const LAST_VISITED_NOTIFICATIONS_KEY =
  "labscity:last-notifications-page-seen-at";
const PENDING_VISIT_START_KEY =
  "labscity:pending-notifications-page-visit-start-at";

function NotificationsHeader({ totalCount }: { totalCount: number }) {
  return (
    <Stack gap={4} align="center">
      <Text c="dimmed" size="sm" ta="center">
        You have {totalCount} notifications.
      </Text>
    </Stack>
  );
}

const LSNotificationsMobileLayout = ({
  isNotificationNew,
}: {
  isNotificationNew: (notificationCreatedAt: string) => boolean;
}) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const dismissNotification = useNotificationStore(
    (state) => state.dismissNotification,
  );
  const markAsReadMutation = useMarkNotificationAsRead();
  const totalCount = notifications.length;

  const handleDismiss = (id: string) => {
    markAsReadMutation.mutate(id);
    dismissNotification(id);
  };

  return (
    <Stack p={8} gap={12}>
      <NotificationsHeader totalCount={totalCount} />
      {notifications.map((notification) => {
        const groupId =
          notification.type === "group_invite"
            ? parseGroupIdFromNotificationLink(notification.link)
            : null;
        if (groupId !== null) {
          return (
            <LSGroupInviteNotificationCard
              key={notification.id}
              notification={notification}
              groupId={groupId}
              isNew={isNotificationNew(notification.created_at)}
              onDismiss={handleDismiss}
            />
          );
        }
        return (
          <LSNotificationCard
            key={notification.id}
            notification={notification}
            isNew={isNotificationNew(notification.created_at)}
            onDismiss={handleDismiss}
          />
        );
      })}
    </Stack>
  );
};

const LSNotificationsDesktopLayout = ({
  isNotificationNew,
}: {
  isNotificationNew: (notificationCreatedAt: string) => boolean;
}) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const dismissNotification = useNotificationStore(
    (state) => state.dismissNotification,
  );
  const markAsReadMutation = useMarkNotificationAsRead();
  const totalCount = notifications.length;

  const handleDismiss = (id: string) => {
    markAsReadMutation.mutate(id);
    dismissNotification(id);
  };

  return (
    <Box py={24} px={80} h='100%'>
      <Flex p={8} direction="row" w="100%" gap={8}>
        <Box flex={5}>
          <NotificationsHeader totalCount={totalCount} />
        </Box>
      </Flex>
      <Divider my={20} color="navy.1" />
      <Stack mt={20} px="30%" gap={12}>
        {notifications.map((notification) => {
          const groupId =
            notification.type === "group_invite"
              ? parseGroupIdFromNotificationLink(notification.link)
              : null;
          if (groupId !== null) {
            return (
              <LSGroupInviteNotificationCard
                key={notification.id}
                notification={notification}
                groupId={groupId}
                isNew={isNotificationNew(notification.created_at)}
                onDismiss={handleDismiss}
              />
            );
          }
          return (
            <LSNotificationCard
              key={notification.id}
              notification={notification}
              isNew={isNotificationNew(notification.created_at)}
              onDismiss={handleDismiss}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default function NotificationsPage() {
  const isMobile = useIsMobile();
  const [previousVisitAtMs, setPreviousVisitAtMs] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const currentVisitStartedAtMs = Date.now();

    const committedSeenAtRaw = window.localStorage.getItem(
      LAST_VISITED_NOTIFICATIONS_KEY,
    );
    const pendingVisitStartRaw = window.localStorage.getItem(
      PENDING_VISIT_START_KEY,
    );

    const parsedCommittedSeenAtMs = committedSeenAtRaw
      ? Number.parseInt(committedSeenAtRaw, 10)
      : Number.NaN;
    const parsedPendingVisitStartMs = pendingVisitStartRaw
      ? Number.parseInt(pendingVisitStartRaw, 10)
      : Number.NaN;

    const effectivePreviousVisitAtMs = Number.isFinite(
      parsedPendingVisitStartMs,
    )
      ? parsedPendingVisitStartMs
      : Number.isFinite(parsedCommittedSeenAtMs)
        ? parsedCommittedSeenAtMs
        : null;

    setPreviousVisitAtMs(effectivePreviousVisitAtMs);

    if (Number.isFinite(parsedPendingVisitStartMs)) {
      window.localStorage.setItem(
        LAST_VISITED_NOTIFICATIONS_KEY,
        String(parsedPendingVisitStartMs),
      );
    }

    // Mark this visit as pending; it becomes "seen" on a future visit.
    window.localStorage.setItem(
      PENDING_VISIT_START_KEY,
      String(currentVisitStartedAtMs),
    );
  }, []);

  const isNotificationNew = useMemo(
    () => (notificationCreatedAt: string) => {
      const notificationCreatedAtMs = Date.parse(notificationCreatedAt);
      if (!Number.isFinite(notificationCreatedAtMs)) {
        return false;
      }

      if (previousVisitAtMs === null) {
        return true;
      }

      return notificationCreatedAtMs > previousVisitAtMs;
    },
    [previousVisitAtMs],
  );

  return isMobile ? (
    <LSNotificationsMobileLayout isNotificationNew={isNotificationNew} />
  ) : (
    <LSNotificationsDesktopLayout isNotificationNew={isNotificationNew} />
  );
}
