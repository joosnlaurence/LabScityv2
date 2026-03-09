"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import LSMiniProfileList from "@/components/profile/ls-mini-profile-list";
import LSProfileHero from "@/components/profile/ls-profile-hero";
import type { User } from "@/lib/types/feed";

type GroupItem = {
  id: string;
  name: string;
  memberCount: number;
  summary: string;
  tags: string[];
};

type GroupMember = {
  id: string;
  name: string;
  role: string;
};

// Static content for design
const groups: Array<GroupItem & { members: GroupMember[] }> = [
  {
    id: "cell-biology-circle",
    name: "Cell Biology Circle",
    memberCount: 148,
    summary: "Weekly protocol swaps, microscopy tips, and shared review notes.",
    tags: ["Microscopy", "Protocols", "Peer Review"],
    members: [
      { id: "m1", name: "Avery Chen", role: "Moderator" },
      { id: "m2", name: "Jordan Patel", role: "Member" },
      { id: "m3", name: "Morgan Diaz", role: "Member" },
      { id: "m4", name: "Taylor Brooks", role: "Member" },
    ],
  },
  {
    id: "materials-lab",
    name: "Materials Lab",
    memberCount: 92,
    summary:
      "A focused group for composites, test data, and fabrication feedback.",
    tags: ["Composites", "Testing", "Manufacturing"],
    members: [
      { id: "m5", name: "Sam Rivera", role: "Moderator" },
      { id: "m6", name: "Casey Nguyen", role: "Member" },
      { id: "m7", name: "Alex Monroe", role: "Member" },
      { id: "m8", name: "Riley Foster", role: "Member" },
    ],
  },
  {
    id: "ai-research-club",
    name: "AI Research Club",
    memberCount: 231,
    summary:
      "Paper discussions, benchmark results, and model implementation notes.",
    tags: ["Papers", "Benchmarks", "ML Systems"],
    members: [
      { id: "m9", name: "Elliot Park", role: "Moderator" },
      { id: "m10", name: "Cameron Lee", role: "Member" },
      { id: "m11", name: "Quinn Howard", role: "Member" },
      { id: "m12", name: "Parker Reed", role: "Member" },
    ],
  },
  {
    id: "water-quality-team",
    name: "Water Quality Team",
    memberCount: 64,
    summary:
      "Field readings, lab coordination, and environmental compliance checklists.",
    tags: ["Field Work", "Lab Ops", "Compliance"],
    members: [
      { id: "m13", name: "Jamie Torres", role: "Moderator" },
      { id: "m14", name: "Dakota Kim", role: "Member" },
      { id: "m15", name: "Rowan Bell", role: "Member" },
      { id: "m16", name: "Skyler James", role: "Member" },
    ],
  },
];

function formatMembers(count: number) {
  return `${count} member${count === 1 ? "" : "s"}`;
}

export default function GroupsPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group") ?? undefined;
  const selectedGroup =
    groups.find((group) => group.id === groupId) ?? groups[0];
  const memberProfiles: User[] = selectedGroup.members.map((member) => {
    const [firstName, ...lastNameParts] = member.name.split(" ");

    return {
      user_id: member.id,
      first_name: firstName ?? member.name,
      last_name: lastNameParts.join(" "),
      email: `${member.id}@groups.labscity.local`,
      research_interests: [member.role],
    };
  });

  return (
    <Flex
      h="calc(100vh - 60px)"
      direction={{ base: "column", md: "row" }}
      bg="gray.0"
    >
      <Paper
        w={{ base: "100%", md: 320 }}
        miw={{ md: 320 }}
        radius={0}
        bg="gray.1"
        style={{ borderRight: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Stack gap={0} h="100%">
          <Box
            p="md"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-3)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Box>
                <Title order={4}>Groups</Title>
                <Text size="sm" c="dimmed">
                  Switch between your active groups.
                </Text>
              </Box>
              <Button
                variant="light"
                size="compact-sm"
                leftSection={<IconPlus size={14} />}
              >
                New
              </Button>
            </Group>
          </Box>

          <ScrollArea h={{ base: 240, md: "calc(100vh - 60px - 89px)" }}>
            <Stack gap={0}>
              {groups.map((group) => {
                const href = `/groups?group=${group.id}`;
                const active = group.id === selectedGroup.id;

                return (
                  <NavLink
                    key={group.id}
                    href={href}
                    active={active}
                    p="md"
                    style={{
                      borderBottom: "1px solid var(--mantine-color-gray-2)",
                    }}
                    label={
                      <Text fw={600} c="navy.7" truncate>
                        {group.name}
                      </Text>
                    }
                    description={
                      <Text size="xs" c="dimmed">
                        {formatMembers(group.memberCount)}
                      </Text>
                    }
                    leftSection={
                      <Avatar color="navy" radius="xl">
                        {group.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>
                    }
                  />
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </Paper>

      <Box
        flex={1}
        py={{ base: "md", md: 24 }}
        px={{ base: "md", md: "xl", lg: 80 }}
      >
        <Flex p={8} direction={{ base: "column", lg: "row" }} w="100%" gap={8}>
          <Box flex={5}>
            <LSProfileHero
              profileName={selectedGroup.name}
              profileResearchInterest=""
              profileAbout={selectedGroup.summary}
              profileSkill={selectedGroup.tags}
              isOwnProfile={false}
            />
          </Box>
          <Box flex={3}>
            <LSMiniProfileList
              widgetTitle={`Members - ${selectedGroup.memberCount}`}
              profiles={memberProfiles}
            />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}
