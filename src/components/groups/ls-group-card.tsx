"use client";

import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import type { GroupDiscoverItem } from "@/lib/types/groups";

export interface LSGroupCardProps {
  group: GroupDiscoverItem;
  isMember: boolean;
  isJoining?: boolean;
  onJoin: (groupId: number) => void;
  onView: (groupId: number) => void;
}

const DESC_MAX = 160;

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
      shadow="sm"
      radius="md"
      p="md"
      h="100%"
      styles={{
        root: {
          transition: "box-shadow 160ms ease, transform 160ms ease",
          "&:hover": {
            boxShadow: "var(--mantine-shadow-md)",
          },
        },
      }}
    >
      <Stack gap="sm" justify="space-between" h="100%">
        <Stack gap="xs">
          <Text fw={600} size="lg" c="navy.7" lineClamp={2}>
            {group.name}
          </Text>
          {desc ? (
            <Text size="sm" c="dimmed" lineClamp={4}>
              {desc}
            </Text>
          ) : null}
          {group.topics.length > 0 ? (
            <Group gap={6} wrap="wrap">
              {group.topics.slice(0, 5).map((t) => (
                <Badge key={t} size="sm" variant="light" color="navy">
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
              color="navy"
              fullWidth
              onClick={() => onView(group.group_id)}
            >
              View
            </Button>
          ) : (
            <Button
              fullWidth
              color="navy"
              loading={isJoining}
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
