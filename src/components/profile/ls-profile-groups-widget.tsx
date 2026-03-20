"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useAuth } from "@/components/auth/use-auth";
import { useProfileGroups } from "@/components/profile/use-profile";
import { LSSpinner } from "@/components/ui/ls-spinner";

/**
 * Profile sidebar widget: groups this user belongs to (public-only for visitors).
 * Hidden when the viewer is not signed in.
 */
export function LSProfileGroupsWidget({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const { user } = useAuth();
  const { data, isPending, isError, error, isFetching } =
    useProfileGroups(userId);

  if (!user?.id) {
    return null;
  }

  if (isPending && isFetching) {
    return (
      <Card shadow="sm" padding="lg" radius="md" h="100%">
        <Center py="md">
          <LSSpinner />
        </Center>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card shadow="sm" padding="lg" radius="md" h="100%">
        <Text size="sm" c="red">
          {error instanceof Error ? error.message : "Could not load groups"}
        </Text>
      </Card>
    );
  }

  const groups = data ?? [];

  return (
    <Card shadow="sm" padding="lg" radius="md" h="100%">
      <Center mb={8}>
        <Text c="navy.7" fw={600} size="xl">
          Groups
        </Text>
      </Center>
      <Stack gap={10}>
        {groups.length > 0 ? (
          groups.map((g) => (
            <UnstyledButton
              key={g.group_id}
              component={Link}
              href={`/groups?group=${g.group_id}`}
              w="100%"
            >
              <Box
                p="xs"
                bg="gray.0"
                style={{
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-2)",
                }}
              >
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Text
                    fw={600}
                    c="navy.7"
                    size="sm"
                    lineClamp={1}
                    style={{ flex: 1 }}
                  >
                    {g.name}
                  </Text>
                  {isOwnProfile && g.privacy === "private" ? (
                    <Badge size="xs" variant="light" color="gray">
                      Private
                    </Badge>
                  ) : null}
                </Group>
                <Text size="xs" c="dimmed">
                  {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
                </Text>
              </Box>
            </UnstyledButton>
          ))
        ) : (
          <Center>
            <Text size="sm" c="navy.6">
              Nothing to see here!
            </Text>
          </Center>
        )}
        <Center>
          <Button
            component={Link}
            href="/groups?tab=discover"
            variant="subtle"
            color="navy"
            size="xs"
          >
            Browse groups
          </Button>
        </Center>
      </Stack>
    </Card>
  );
}
