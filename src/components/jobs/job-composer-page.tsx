"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Group,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconCurrencyDollar,
  IconExternalLink,
  IconEye,
  IconMapPin,
  IconSend,
  IconTag,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface JobDraft {
  title: string;
  organization: string;
  department: string;
  location: string;
  type: string;
  remote: string;
  salary: string;
  deadline: string;
  contactEmail: string;
  applyUrl: string;
  summary: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  tags: string[];
}

export function JobComposerPage() {
  const [draft, setDraft] = useState<JobDraft>({
    title: "",
    organization: "",
    department: "",
    location: "",
    type: "Postdoc",
    remote: "On-site",
    salary: "",
    deadline: "",
    contactEmail: "",
    applyUrl: "",
    summary: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    tags: ["Optics", "Computer Vision"],
  });
  const [publishNow, setPublishNow] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  const tips = useMemo(
    () => [
      { text: "Use a clear, specific job title", done: draft.title.length > 0 },
      { text: "Include required skills as tags", done: draft.tags.length > 0 },
      { text: "Add an application deadline", done: draft.deadline.length > 0 },
      {
        text: "Specify remote / on-site status",
        done: draft.remote.length > 0,
      },
      {
        text: "Write 2-3 sentences of description",
        done: draft.description.length > 80 || draft.summary.length > 40,
      },
    ],
    [draft],
  );

  const updateDraft = <K extends keyof JobDraft>(
    key: K,
    value: JobDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <Box bg="gray.0" mih="calc(100vh - 56px)">
      {published && (
        <Card
          pos="fixed"
          top={72}
          right={24}
          shadow="xl"
          radius="md"
          withBorder
          style={{ zIndex: 50, borderColor: "var(--mantine-color-green-3)" }}
        >
          <Group gap="sm">
            <IconCheck size={20} color="var(--mantine-color-green-7)" />
            <Box>
              <Text size="sm" fw={800}>
                Job posted successfully
              </Text>
              <Text size="xs" c="dimmed">
                This is a placeholder until publishing is wired.
              </Text>
            </Box>
          </Group>
        </Card>
      )}

      <Box maw={1200} mx="auto" px={{ base: "sm", md: "xl" }} py="xl">
        <Group justify="space-between" align="flex-end" mb="lg">
          <Box>
            <Text component="h1" fz={28} fw={800} c="gray.9" m={0}>
              Post a Job
            </Text>
            <Text size="sm" c="dimmed">
              Share opportunities with researchers, students, and collaborators.
            </Text>
          </Box>
          <Button component={Link} href="/jobs" variant="outline" color="gray">
            Back to Jobs
          </Button>
        </Group>

        <Flex gap="lg" align="flex-start">
          <Stack flex={1} miw={0}>
            <FormSection
              title="Basic Information"
              icon={<IconBriefcase size={18} />}
            >
              <TextInput
                label="Job Title"
                withAsterisk
                placeholder="e.g. Postdoctoral Researcher - Computational Microscopy"
                value={draft.title}
                onChange={(event) =>
                  updateDraft("title", event.currentTarget.value)
                }
              />
              <Flex gap="md" direction={{ base: "column", sm: "row" }}>
                <TextInput
                  label="Organization / Lab"
                  withAsterisk
                  placeholder="e.g. UCF, Caltech, Google"
                  value={draft.organization}
                  onChange={(event) =>
                    updateDraft("organization", event.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="Department"
                  placeholder="e.g. CREOL, Radiology"
                  value={draft.department}
                  onChange={(event) =>
                    updateDraft("department", event.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                />
              </Flex>
              <Flex gap="md" direction={{ base: "column", sm: "row" }}>
                <TextInput
                  label="Location"
                  placeholder="City, State or Remote"
                  value={draft.location}
                  onChange={(event) =>
                    updateDraft("location", event.currentTarget.value)
                  }
                  leftSection={<IconMapPin size={16} />}
                  style={{ flex: 1 }}
                />
                <Select
                  label="Work Mode"
                  value={draft.remote}
                  onChange={(value) =>
                    updateDraft("remote", value ?? "On-site")
                  }
                  data={["On-site", "Hybrid", "Remote"]}
                  style={{ flex: 1 }}
                />
              </Flex>
              <Box>
                <Text size="sm" fw={600} mb={8}>
                  Job Type
                </Text>
                <Group gap="xs">
                  {[
                    "Postdoc",
                    "Faculty",
                    "PhD",
                    "Full-time",
                    "Part-time",
                    "Internship",
                    "Contract",
                  ].map((type) => (
                    <Button
                      key={type}
                      size="compact-sm"
                      radius="xl"
                      variant={draft.type === type ? "filled" : "outline"}
                      color={draft.type === type ? "navy" : "gray"}
                      onClick={() => updateDraft("type", type)}
                    >
                      {type}
                    </Button>
                  ))}
                </Group>
              </Box>
            </FormSection>

            <FormSection title="Description" icon={<IconTag size={18} />}>
              <Textarea
                label="Short Summary"
                withAsterisk
                autosize
                minRows={2}
                placeholder="2-3 sentence overview of the role..."
                value={draft.summary}
                onChange={(event) =>
                  updateDraft("summary", event.currentTarget.value)
                }
              />
              <Textarea
                label="Full Description"
                withAsterisk
                autosize
                minRows={4}
                placeholder="Describe the research context, team, and goals..."
                value={draft.description}
                onChange={(event) =>
                  updateDraft("description", event.currentTarget.value)
                }
              />
              <Textarea
                label="Responsibilities"
                autosize
                minRows={3}
                placeholder="List key responsibilities, one per line..."
                value={draft.responsibilities}
                onChange={(event) =>
                  updateDraft("responsibilities", event.currentTarget.value)
                }
              />
              <Textarea
                label="Qualifications"
                autosize
                minRows={3}
                placeholder="Required and preferred qualifications..."
                value={draft.qualifications}
                onChange={(event) =>
                  updateDraft("qualifications", event.currentTarget.value)
                }
              />
            </FormSection>

            <FormSection title="Research Fit" icon={<IconTag size={18} />}>
              <TagsInput
                label="Skills & Research Tags"
                value={draft.tags}
                onChange={(tags) => updateDraft("tags", tags)}
                placeholder="Add tags and press Enter..."
                data={[
                  "Optics",
                  "Computer Vision",
                  "Machine Learning",
                  "Microscopy",
                  "Physics-Informed NN",
                  "Holography",
                ]}
              />
              <Textarea
                label="Preferred Background"
                autosize
                minRows={2}
                placeholder="e.g. Background in optics + ML, familiarity with PyTorch..."
              />
            </FormSection>

            <FormSection title="Logistics" icon={<IconCalendar size={18} />}>
              <Flex gap="md" direction={{ base: "column", sm: "row" }}>
                <TextInput
                  label="Salary / Stipend / Funding"
                  placeholder="e.g. $58K-$68K / yr"
                  value={draft.salary}
                  onChange={(event) =>
                    updateDraft("salary", event.currentTarget.value)
                  }
                  leftSection={<IconCurrencyDollar size={16} />}
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="Application Deadline"
                  placeholder="e.g. May 1, 2026"
                  value={draft.deadline}
                  onChange={(event) =>
                    updateDraft("deadline", event.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                />
              </Flex>
              <Flex gap="md" direction={{ base: "column", sm: "row" }}>
                <TextInput
                  label="Contact Email"
                  placeholder="hr@university.edu"
                  value={draft.contactEmail}
                  onChange={(event) =>
                    updateDraft("contactEmail", event.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="External Application Link"
                  placeholder="https://apply.university.edu/..."
                  value={draft.applyUrl}
                  onChange={(event) =>
                    updateDraft("applyUrl", event.currentTarget.value)
                  }
                  leftSection={<IconExternalLink size={16} />}
                  style={{ flex: 1 }}
                />
              </Flex>
            </FormSection>

            <FormSection
              title="Visibility & Publishing"
              icon={<IconEye size={18} />}
            >
              <Checkbox
                checked={publishNow}
                onChange={(event) => setPublishNow(event.currentTarget.checked)}
                label="Publish immediately"
                description="Your listing goes live after the real publishing flow is wired."
              />
              <Checkbox
                checked={featured}
                onChange={(event) => setFeatured(event.currentTarget.checked)}
                label="Featured listing"
                description="Placeholder visibility option for the future jobs backend."
                color="yellow"
              />
            </FormSection>
          </Stack>

          <Stack w={310} gap="md" visibleFrom="lg" pos="sticky" top={80}>
            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Group gap="xs" mb="sm">
                <IconEye size={17} color="var(--mantine-color-navy-7)" />
                <Text size="sm" fw={800}>
                  Live Preview
                </Text>
              </Group>
              <MiniPreviewCard draft={draft} />
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Updates as you type.
              </Text>
            </Card>

            <Card radius="md" padding="md" withBorder bg="yellow.0">
              <Text size="sm" fw={800} c="yellow.9" mb="sm">
                Posting Tips
              </Text>
              <Stack gap="xs">
                {tips.map((tip) => (
                  <Group
                    key={tip.text}
                    gap="xs"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <IconCheck
                      size={16}
                      color={
                        tip.done
                          ? "var(--mantine-color-green-7)"
                          : "var(--mantine-color-gray-4)"
                      }
                    />
                    <Text size="xs" c={tip.done ? "green.8" : "yellow.9"}>
                      {tip.text}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Card>

            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Stack gap="xs">
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={<IconEye size={16} />}
                >
                  Preview Full Listing
                </Button>
                <Button
                  color="navy"
                  leftSection={<IconSend size={16} />}
                  onClick={() => setPublished(true)}
                >
                  Publish Job
                </Button>
              </Stack>
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Publishing is local-only until the jobs backend is added.
              </Text>
            </Card>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
      <Group
        gap="sm"
        mb="md"
        pb="sm"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
      >
        <Box c="navy.7">{icon}</Box>
        <Text size="md" fw={800}>
          {title}
        </Text>
      </Group>
      <Stack gap="md">{children}</Stack>
    </Card>
  );
}

function MiniPreviewCard({ draft }: { draft: JobDraft }) {
  return (
    <Card radius="md" withBorder padding="sm">
      <Text size="sm" fw={800} lineClamp={2}>
        {draft.title || "Job title will appear here"}
      </Text>
      <Group gap={6} mt={4}>
        <Text size="xs" fw={650} c="gray.7">
          {draft.organization || "Organization"}
        </Text>
        {draft.location && (
          <>
            <Text size="xs" c="gray.4">
              -
            </Text>
            <Text size="xs" c="dimmed">
              {draft.location}
            </Text>
          </>
        )}
      </Group>
      <Group gap={6} mt={8}>
        <Badge variant="light" color="gray">
          {draft.type}
        </Badge>
        <Badge
          variant="light"
          color={draft.remote === "Remote" ? "green" : "blue"}
        >
          {draft.remote}
        </Badge>
      </Group>
      {draft.tags.length > 0 && (
        <Group gap={4} mt="sm">
          {draft.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} size="sm" variant="light" color="gray">
              {tag}
            </Badge>
          ))}
        </Group>
      )}
      <Group gap="xs" mt="md">
        <Button size="compact-xs" color="navy">
          View Details
        </Button>
        <Button size="compact-xs" variant="outline" color="gray">
          Apply
        </Button>
      </Group>
    </Card>
  );
}
