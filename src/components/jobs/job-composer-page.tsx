"use client";

import {
  Alert,
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
  TextInput,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconExternalLink,
  IconEye,
  IconInfoCircle,
  IconMapPin,
  IconSend,
  IconTag,
} from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createPostEditorExtensions } from "@/components/feed/post-rich-text-content";
import type { createJob } from "@/lib/actions/job";

export interface JobDraft {
  title: string;
  organization: string;
  department: string;
  location: string;
  type:
    | "Postdoc"
    | "Faculty"
    | "PhD"
    | "Grad Student"
    | "Full-time"
    | "Part-time"
    | "Internship"
    | "Contract";
  remote: "On-site" | "Hybrid" | "Remote";
  contactEmail: string;
  applyUrl: string;
  description: string;
  tags: string[];
}

interface JobComposerPageProps {
  createJobAction: typeof createJob;
}

export function JobComposerPage({ createJobAction }: JobComposerPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<JobDraft>({
    title: "",
    organization: "",
    department: "",
    location: "",
    type: "Postdoc",
    remote: "On-site",
    contactEmail: "",
    applyUrl: "",
    description: "",
    tags: ["Optics", "Computer Vision"],
  });

  const [publishNow, setPublishNow] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateDraft = <K extends keyof JobDraft>(
    key: K,
    value: JobDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const descriptionEditor = useEditor({
    immediatelyRender: false,
    extensions: createPostEditorExtensions(
      "Describe the research context, team, goals, responsibilities, and qualifications...",
    ),
    content: "",
    onUpdate: ({ editor }) => {
      updateDraft("description", editor.getHTML());
    },
  });

  const tips = useMemo(
    () => [
      { text: "Use a clear, specific job title", done: draft.title.length > 0 },
      { text: "Include required skills as tags", done: draft.tags.length > 0 },
      {
        text: "Add an external application link",
        done: draft.applyUrl.length > 0,
      },
      {
        text: "Specify remote / on-site status",
        done: draft.remote.length > 0,
      },
      {
        text: "Write 2-3 sentences of description",
        done: draft.description.length > 80,
      },
    ],
    [draft],
  );

  const handlePublish = () => {
    setErrorMessage(null);

    startTransition(async () => {
      const roleValue =
        draft.type === "Postdoc" ||
        draft.type === "Faculty" ||
        draft.type === "PhD" ||
        draft.type === "Grad Student"
          ? draft.type
          : undefined;
      const jobTypeValue =
        draft.type === "Full-time" ||
        draft.type === "Part-time" ||
        draft.type === "Internship" ||
        draft.type === "Contract"
          ? draft.type
          : undefined;
      const workMode: "remote" | "hybrid" | "on-site" =
        draft.remote === "Remote"
          ? "remote"
          : draft.remote === "Hybrid"
            ? "hybrid"
            : "on-site";

      const result = await createJobAction({
        title: draft.title,
        description: draft.description,
        location: draft.location || undefined,
        department: draft.department || undefined,
        organization: draft.organization || undefined,
        work_mode: workMode,
        job_type: jobTypeValue,
        academia_role: roleValue,
        application_link: draft.applyUrl || undefined,
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error ?? "Failed to publish job");
        return;
      }

      router.push(`/jobs/${result.data.id}`);
      router.refresh();
    });
  };

  return (
    <Box bg="gray.0" mih="calc(100vh - 56px)">
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
            {errorMessage ? (
              <Alert color="red" title="Could not publish job">
                {errorMessage}
              </Alert>
            ) : null}

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
                    updateDraft(
                      "remote",
                      (value as JobDraft["remote"] | null) ?? "On-site",
                    )
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
                    "Grad Student",
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
                      onClick={() =>
                        updateDraft("type", type as JobDraft["type"])
                      }
                    >
                      {type}
                    </Button>
                  ))}
                </Group>
              </Box>
            </FormSection>

            <FormSection title="Description" icon={<IconTag size={18} />}>
              <Box>
                <Text size="sm" fw={500} mb={6}>
                  Full Description <Text span c="red">*</Text>
                </Text>
                <RichTextEditor
                  editor={descriptionEditor}
                  styles={{
                    root: { borderColor: "#E5E7EB", borderRadius: 8 },
                    content: { minHeight: 160 },
                  }}
                >
                  <RichTextEditor.Toolbar sticky={false}>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.Italic />
                      <RichTextEditor.Strikethrough />
                      <RichTextEditor.ClearFormatting />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.BulletList />
                      <RichTextEditor.OrderedList />
                      <RichTextEditor.Blockquote />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.AlignLeft />
                      <RichTextEditor.AlignCenter />
                      <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>
                  </RichTextEditor.Toolbar>
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Box>
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
            </FormSection>

            <FormSection title="Logistics" icon={<IconCalendar size={18} />}>
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
              />
              <Checkbox
                checked={featured}
                onChange={(event) => setFeatured(event.currentTarget.checked)}
                label="Featured listing"
                description="Currently visual only until a featured-jobs backend exists."
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

            <Alert
              color="blue"
              icon={<IconInfoCircle size={16} />}
              title="What gets saved"
            >
              Title, description, organization, location, department, job type,
              work mode, and application link are stored on publish. Tags,
              contact email, and featured status are not yet backed and will be
              discarded.
            </Alert>

            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Stack gap="xs">
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={<IconEye size={16} />}
                  disabled
                >
                  Preview Full Listing
                </Button>
                <Button
                  color="navy"
                  leftSection={<IconSend size={16} />}
                  onClick={handlePublish}
                  loading={isPending}
                  disabled={
                    !publishNow ||
                    draft.title.trim().length === 0 ||
                    !descriptionEditor ||
                    descriptionEditor.isEmpty
                  }
                >
                  Publish Job
                </Button>
              </Stack>
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
        <Button size="compact-xs" variant="light" color="gray">
          {draft.type}
        </Button>
        <Button
          size="compact-xs"
          variant="light"
          color={draft.remote === "Remote" ? "green" : "blue"}
        >
          {draft.remote}
        </Button>
      </Group>
      {draft.tags.length > 0 ? (
        <Group gap={4} mt="sm">
          {draft.tags.slice(0, 3).map((tag) => (
            <Button key={tag} size="compact-xs" variant="light" color="gray">
              {tag}
            </Button>
          ))}
        </Group>
      ) : null}
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
