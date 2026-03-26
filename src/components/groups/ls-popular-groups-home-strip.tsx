"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LSSpinner } from "@/components/ui/ls-spinner";
import type {
  getGroups,
  joinGroup,
  searchPublicGroups,
} from "@/lib/actions/groups";
import { groupKeys } from "@/lib/query-keys";

const POPULAR_LIMIT = 6;

function stripInitials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface LSPopularGroupsHomeStripProps {
  searchPublicGroupsAction: typeof searchPublicGroups;
  joinGroupAction: typeof joinGroup;
  getGroupsAction: typeof getGroups;
}

/**
 * Compact “trending” public groups on the home feed (active groups first).
 */
export function LSPopularGroupsHomeStrip({
  searchPublicGroupsAction,
  joinGroupAction,
  getGroupsAction,
}: LSPopularGroupsHomeStripProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: myGroups = [] } = useQuery({
    queryKey: groupKeys.list(),
    queryFn: async () => {
      const r = await getGroupsAction();
      if (!r.success || !r.data) {
        throw new Error(r.error ?? "Failed to load your groups");
      }
      return r.data;
    },
  });

  const myGroupIds = new Set(myGroups.map((g) => g.group_id));

  const popularQuery = useQuery({
    queryKey: groupKeys.popular(POPULAR_LIMIT),
    queryFn: async () => {
      const r = await searchPublicGroupsAction({
        query: "",
        topicTags: [],
        limit: POPULAR_LIMIT,
      });
      if (!r.success) {
        throw new Error(r.error ?? "Failed to load groups");
      }
      return r.data ?? [];
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const r = await joinGroupAction(groupId);
      if (!r.success) {
        throw new Error(r.error ?? "Could not join");
      }
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      notifications.show({
        title: "Joined group",
        message: "Open it from Groups anytime.",
        color: "green",
      });
      router.push(`/groups?group=${groupId}`);
    },
    onError: (err: Error) => {
      notifications.show({
        title: "Could not join",
        message: err.message,
        color: "red",
      });
    },
  });

  if (popularQuery.isLoading) {
    return (
      <Card withBorder shadow="sm" radius="md" p="md" bg="white">
        <Group justify="center" py="sm">
          <LSSpinner />
        </Group>
      </Card>
    );
  }

  if (popularQuery.isError || !popularQuery.data?.length) {
    return null;
  }

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="lg"
      styles={{
        root: {
          background:
            "linear-gradient(180deg, var(--mantine-color-gray-0) 0%, white 100%)",
        },
      }}
    >
      <Group
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap="sm"
        mb="md"
      >
        <div>
          <Title order={5} c="navy.7">
            Popular groups
          </Title>
          <Text size="xs" c="dimmed">
            Active public communities you can join
          </Text>
        </div>
        <Button
          component={Link}
          href="/groups?tab=discover"
          variant="light"
          color="navy"
          size="xs"
          radius="xl"
        >
          Discover more
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {popularQuery.data.map((g) => {
          const member = myGroupIds.has(g.group_id);
          return (
            <Box
              key={g.group_id}
              p="sm"
              style={{
                borderRadius: "var(--mantine-radius-md)",
                border: "1px solid var(--mantine-color-gray-2)",
                backgroundColor: "white",
              }}
            >
              <Stack gap={6}>
                <Group gap="xs" align="center" wrap="nowrap">
                  <Avatar
                    size={36}
                    radius="md"
                    color="navy.7"
                    bg="navy.7"
                    src={g.avatar_url ?? undefined}
                  >
                    {stripInitials(g.name)}
                  </Avatar>
                  <Text
                    fw={600}
                    c="navy.7"
                    size="sm"
                    lineClamp={2}
                    style={{ flex: 1 }}
                  >
                    {g.name}
                  </Text>
                </Group>
                {g.topics.length > 0 ? (
                  <Group gap={4} wrap="wrap">
                    {g.topics.slice(0, 2).map((t) => (
                      <Badge key={t} size="xs" variant="light" color="navy">
                        {t}
                      </Badge>
                    ))}
                  </Group>
                ) : null}
                {member ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="navy"
                    fullWidth
                    component={Link}
                    href={`/groups?group=${g.group_id}`}
                  >
                    View
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    color="navy"
                    fullWidth
                    loading={
                      joinMutation.isPending &&
                      joinMutation.variables === g.group_id
                    }
                    onClick={() => joinMutation.mutate(g.group_id)}
                  >
                    Join
                  </Button>
                )}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Card>
  );
}
