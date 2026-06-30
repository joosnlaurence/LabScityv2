"use client";

import { Avatar, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import type { GroupDiscoverItem } from "@/lib/types/groups";

export interface LSGroupCardProps {
  group: GroupDiscoverItem;
  isMember: boolean;
  isJoining?: boolean;
  onJoin: (groupId: number) => void;
  onView: (groupId: number) => void;
}

const DESC_MAX = 160;

function cardInitials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Compact preview card for a public group on the Discover tab.
 */
export function LSGroupCard({
  group,
  isMember,
  isJoining,
  onJoin,
  onView,
}: LSGroupCardProps) {
  const desc =
    group.description.length > DESC_MAX
      ? `${group.description.slice(0, DESC_MAX).trimEnd()}…`
      : group.description;

  return (
    <Card
      withBorder
      shadow="xs"
      radius="xl"
      p="lg"
      h="100%"
      bg="white"
      styles={{
        root: {
          borderColor: "#E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          transition: "box-shadow 160ms ease, transform 160ms ease",
          "&:hover": {
            boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
            transform: "translateY(-2px)",
          },
        },
      }}
    >
      <Stack gap="sm" justify="space-between" h="100%">
        <Stack gap="xs">
          <Group gap="sm" align="center" wrap="nowrap">
            <Avatar
              size={48}
              radius="xl"
              color="blue"
              bg={group.avatar_url ? undefined : "#1F3A5F"}
              src={group.avatar_url ?? undefined}
            >
              {cardInitials(group.name)}
            </Avatar>
            <Text
              fw={700}
              size="lg"
              c="#123257"
              lineClamp={2}
              style={{ flex: 1 }}
            >
              {group.name}
            </Text>
          </Group>
          {desc ? (
            <Text size="sm" c="#64748B" lineClamp={4} lh={1.6}>
              {desc}
            </Text>
          ) : null}
          {group.topics.length > 0 ? (
            <Group gap={6} wrap="wrap">
              {group.topics.slice(0, 5).map((t) => (
                <Badge
                  key={t}
                  size="sm"
                  variant="light"
                  style={{
                    background: "#EEF2FF",
                    color: "#2563EB",
                    border: "1px solid #DBEAFE",
                  }}
                >
                  {t}
                </Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
        <Group gap="xs" wrap="nowrap" mt="auto">
          {isMember ? (
            <Button
              variant="light"
              fullWidth
              radius="xl"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
              onClick={() => onView(group.group_id)}
            >
              View
            </Button>
          ) : (
            <Button
              fullWidth
              radius="xl"
              loading={isJoining}
              style={{ background: "#1F3A5F" }}
              onClick={() => onJoin(group.group_id)}
            >
              Join
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
