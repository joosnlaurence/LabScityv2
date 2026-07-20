"use client";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  MultiSelect,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import {
  IconBriefcase,
  IconCalendar,
  IconExternalLink,
  IconEye,
  IconMapPin,
  IconSend,
  IconTag,
} from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createPostEditorExtensions } from "@/components/feed/post-rich-text-content";
import {
  useLocationSearch,
  useSkillSearch,
  useTagSearch,
} from "@/components/profile/use-profile-search";
import type { addJobSkill, addJobTag, createJob } from "@/lib/actions/job";
import { JOB_SUMMARY_MAX_LENGTH } from "@/lib/validations/job";
import {
  formatJobTypeLabel,
  formatWorkModeLabel,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "./job-display";

export interface JobDraft {
  title: string;
  organization: string;
  department: string;
  location: string;
  type:
    | "postdoc"
    | "faculty"
    | "phd"
    | "grad_student"
    | "full-time"
    | "part-time"
    | "internship"
    | "contract";
  remote: "on-site" | "hybrid" | "remote";
  contactEmail: string;
  applyUrl: string;
  summary: string;
  description: string;
}

interface JobComposerPageProps {
  createJobAction: typeof createJob;
  addJobTagAction: typeof addJobTag;
  addJobSkillAction: typeof addJobSkill;
}

export function JobComposerPage({
  createJobAction,
  addJobTagAction,
  addJobSkillAction,
}: JobComposerPageProps) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<JobDraft>({
    title: "",
    organization: "",
    department: "",
    location: "",
    type: "postdoc",
    remote: "on-site",
    contactEmail: "",
    applyUrl: "",
    summary: "",
    description: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requiredAreaIds, setRequiredAreaIds] = useState<string[]>([]);
  const [recommendedAreaIds, setRecommendedAreaIds] = useState<string[]>([]);
  const [requiredSkillIds, setRequiredSkillIds] = useState<string[]>([]);
  const [recommendedSkillIds, setRecommendedSkillIds] = useState<string[]>([]);
  const [tagLabelsById, setTagLabelsById] = useState<Record<string, string>>(
    {},
  );
  const [skillLabelsById, setSkillLabelsById] = useState<
    Record<string, string>
  >({});
  const [requiredAreaSearch, setRequiredAreaSearch] = useState("");
  const [recommendedAreaSearch, setRecommendedAreaSearch] = useState("");
  const [requiredSkillSearch, setRequiredSkillSearch] = useState("");
  const [recommendedSkillSearch, setRecommendedSkillSearch] = useState("");
  const [debouncedLocation] = useDebouncedValue(draft.location, 500);
  const [debouncedRequiredAreaSearch] = useDebouncedValue(
    requiredAreaSearch,
    300,
  );
  const [debouncedRecommendedAreaSearch] = useDebouncedValue(
    recommendedAreaSearch,
    300,
  );
  const [debouncedRequiredSkillSearch] = useDebouncedValue(
    requiredSkillSearch,
    300,
  );
  const [debouncedRecommendedSkillSearch] = useDebouncedValue(
    recommendedSkillSearch,
    300,
  );
  const locationSearchQuery = useLocationSearch(debouncedLocation);
  const requiredAreaQuery = useTagSearch(debouncedRequiredAreaSearch);
  const recommendedAreaQuery = useTagSearch(debouncedRecommendedAreaSearch);
  const requiredSkillQuery = useSkillSearch(debouncedRequiredSkillSearch);
  const recommendedSkillQuery = useSkillSearch(debouncedRecommendedSkillSearch);
  const locationOptions = useMemo(
    () => (locationSearchQuery.data ?? []).map((result) => result.display_name),
    [locationSearchQuery.data],
  );
  const selectedAreaIds = useMemo(
    () => [...requiredAreaIds, ...recommendedAreaIds],
    [recommendedAreaIds, requiredAreaIds],
  );
  const selectedSkillIds = useMemo(
    () => [...requiredSkillIds, ...recommendedSkillIds],
    [recommendedSkillIds, requiredSkillIds],
  );

  useEffect(() => {
    setTagLabelsById((current) =>
      mergeLabels(current, [
        ...(requiredAreaQuery.data ?? []),
        ...(recommendedAreaQuery.data ?? []),
      ]),
    );
  }, [recommendedAreaQuery.data, requiredAreaQuery.data]);

  useEffect(() => {
    setSkillLabelsById((current) =>
      mergeLabels(current, [
        ...(requiredSkillQuery.data ?? []),
        ...(recommendedSkillQuery.data ?? []),
      ]),
    );
  }, [recommendedSkillQuery.data, requiredSkillQuery.data]);

  const requiredAreaOptions = useMemo(
    () =>
      buildSelectOptions(
        requiredAreaQuery.data ?? [],
        selectedAreaIds,
        tagLabelsById,
      ),
    [requiredAreaQuery.data, selectedAreaIds, tagLabelsById],
  );
  const recommendedAreaOptions = useMemo(
    () =>
      buildSelectOptions(
        recommendedAreaQuery.data ?? [],
        selectedAreaIds,
        tagLabelsById,
      ),
    [recommendedAreaQuery.data, selectedAreaIds, tagLabelsById],
  );
  const requiredSkillOptions = useMemo(
    () =>
      buildSelectOptions(
        requiredSkillQuery.data ?? [],
        selectedSkillIds,
        skillLabelsById,
      ),
    [requiredSkillQuery.data, selectedSkillIds, skillLabelsById],
  );
  const recommendedSkillOptions = useMemo(
    () =>
      buildSelectOptions(
        recommendedSkillQuery.data ?? [],
        selectedSkillIds,
        skillLabelsById,
      ),
    [recommendedSkillQuery.data, selectedSkillIds, skillLabelsById],
  );
  const previewTags = useMemo(
    () =>
      [
        ...requiredAreaIds.map((id) => tagLabelsById[id]),
        ...requiredSkillIds.map((id) => skillLabelsById[id]),
        ...recommendedAreaIds.map((id) => tagLabelsById[id]),
        ...recommendedSkillIds.map((id) => skillLabelsById[id]),
      ].filter(Boolean),
    [
      recommendedAreaIds,
      recommendedSkillIds,
      requiredAreaIds,
      requiredSkillIds,
      skillLabelsById,
      tagLabelsById,
    ],
  );

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

  const hasPublishableDescription = useMemo(() => {
    const plainText = draft.description
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim();

    return plainText.length > 0;
  }, [draft.description]);

  const handlePublish = () => {
    setErrorMessage(null);

    startTransition(async () => {
      const roleValue =
        draft.type === "postdoc" ||
        draft.type === "faculty" ||
        draft.type === "phd" ||
        draft.type === "grad_student"
          ? draft.type
          : undefined;
      const jobTypeValue =
        draft.type === "full-time" ||
        draft.type === "part-time" ||
        draft.type === "internship" ||
        draft.type === "contract"
          ? draft.type
          : undefined;
      const workMode: "remote" | "hybrid" | "on-site" =
        draft.remote === "remote"
          ? "remote"
          : draft.remote === "hybrid"
            ? "hybrid"
            : "on-site";

      const result = await createJobAction({
        title: draft.title,
        description: draft.description,
        summary: draft.summary.trim() || undefined,
        location: draft.location || undefined,
        department: draft.department || undefined,
        organization: draft.organization || undefined,
        work_mode: workMode,
        job_type: jobTypeValue,
        academia_role: roleValue,
        application_link: draft.applyUrl || undefined,
        contact_email: draft.contactEmail.trim() || undefined,
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error ?? "Failed to publish job");
        return;
      }

      const jobId = result.data.id;
      const fitResults = await Promise.all([
        ...requiredAreaIds.map((id) =>
          addJobTagAction(jobId, Number(id), true),
        ),
        ...recommendedAreaIds.map((id) =>
          addJobTagAction(jobId, Number(id), false),
        ),
        ...requiredSkillIds.map((id) =>
          addJobSkillAction(jobId, Number(id), true),
        ),
        ...recommendedSkillIds.map((id) =>
          addJobSkillAction(jobId, Number(id), false),
        ),
      ]);
      const fitError = fitResults.find((fitResult) => !fitResult.success);

      if (fitError && !fitError.success) {
        setErrorMessage(
          `Job was created, but research fit could not be saved: ${fitError.error}`,
        );
        return;
      }

      window.location.assign(`/jobs/${result.data.id}`);
    });
  };

  return (
    <Box mih="calc(100vh - 56px)">
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
                <Autocomplete
                  label="Location"
                  placeholder="City, State or Remote"
                  value={draft.location}
                  onChange={(value) => updateDraft("location", value)}
                  data={locationOptions}
                  leftSection={<IconMapPin size={16} />}
                  rightSection={
                    locationSearchQuery.isFetching ? (
                      <Loader size={14} />
                    ) : undefined
                  }
                  style={{ flex: 1 }}
                />
                <Select
                  label="Work Mode"
                  value={draft.remote}
                  onChange={(value) =>
                    updateDraft(
                      "remote",
                      (value as JobDraft["remote"] | null) ?? "on-site",
                    )
                  }
                  data={WORK_MODE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  style={{ flex: 1 }}
                />
              </Flex>
              <Box>
                <Text size="sm" fw={600} mb={8}>
                  Job Type
                </Text>
                <Group gap="xs">
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <Button
                      key={type.value}
                      size="compact-sm"
                      radius="xl"
                      variant={draft.type === type.value ? "filled" : "outline"}
                      color={draft.type === type.value ? "navy" : "gray"}
                      onClick={() => updateDraft("type", type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </Group>
              </Box>
            </FormSection>

            <FormSection title="Description" icon={<IconTag size={18} />}>
              <Textarea
                label="Short Summary"
                description="Optional preview text shown on job cards."
                placeholder="A concise 1-3 line overview for researchers browsing jobs..."
                value={draft.summary}
                onChange={(event) =>
                  updateDraft("summary", event.currentTarget.value)
                }
                autosize
                minRows={2}
                maxRows={3}
                maxLength={JOB_SUMMARY_MAX_LENGTH}
                rightSectionWidth={64}
                rightSection={
                  <Text size="xs" c="dimmed" pr="xs">
                    {draft.summary.length}/{JOB_SUMMARY_MAX_LENGTH}
                  </Text>
                }
              />
              <Box>
                <Text size="sm" fw={500} mb={6}>
                  Full Description{" "}
                  <Text span c="red">
                    *
                  </Text>
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
              <Flex gap="md" direction={{ base: "column", md: "row" }}>
                <MultiSelect
                  label="Required Research Areas"
                  placeholder="Search research areas..."
                  data={requiredAreaOptions}
                  value={requiredAreaIds}
                  onChange={(next) => {
                    setRequiredAreaIds(next);
                    setRecommendedAreaIds((current) =>
                      current.filter((id) => !next.includes(id)),
                    );
                  }}
                  searchValue={requiredAreaSearch}
                  onSearchChange={setRequiredAreaSearch}
                  searchable
                  clearable
                  hidePickedOptions
                  nothingFoundMessage="No matching research areas"
                  comboboxProps={{ shadow: "sm" }}
                  style={{ flex: 1 }}
                />
                <MultiSelect
                  label="Recommended Research Areas"
                  placeholder="Search research areas..."
                  data={recommendedAreaOptions}
                  value={recommendedAreaIds}
                  onChange={(next) => {
                    setRecommendedAreaIds(next);
                    setRequiredAreaIds((current) =>
                      current.filter((id) => !next.includes(id)),
                    );
                  }}
                  searchValue={recommendedAreaSearch}
                  onSearchChange={setRecommendedAreaSearch}
                  searchable
                  clearable
                  hidePickedOptions
                  nothingFoundMessage="No matching research areas"
                  comboboxProps={{ shadow: "sm" }}
                  style={{ flex: 1 }}
                />
              </Flex>
              <Flex gap="md" direction={{ base: "column", md: "row" }}>
                <MultiSelect
                  label="Required Skills"
                  placeholder="Search skills..."
                  data={requiredSkillOptions}
                  value={requiredSkillIds}
                  onChange={(next) => {
                    setRequiredSkillIds(next);
                    setRecommendedSkillIds((current) =>
                      current.filter((id) => !next.includes(id)),
                    );
                  }}
                  searchValue={requiredSkillSearch}
                  onSearchChange={setRequiredSkillSearch}
                  searchable
                  clearable
                  hidePickedOptions
                  nothingFoundMessage="No matching skills"
                  comboboxProps={{ shadow: "sm" }}
                  style={{ flex: 1 }}
                />
                <MultiSelect
                  label="Recommended Skills"
                  placeholder="Search skills..."
                  data={recommendedSkillOptions}
                  value={recommendedSkillIds}
                  onChange={(next) => {
                    setRecommendedSkillIds(next);
                    setRequiredSkillIds((current) =>
                      current.filter((id) => !next.includes(id)),
                    );
                  }}
                  searchValue={recommendedSkillSearch}
                  onSearchChange={setRecommendedSkillSearch}
                  searchable
                  clearable
                  hidePickedOptions
                  nothingFoundMessage="No matching skills"
                  comboboxProps={{ shadow: "sm" }}
                  style={{ flex: 1 }}
                />
              </Flex>
            </FormSection>

            <FormSection title="Logistics" icon={<IconCalendar size={18} />}>
              <Flex gap="md" direction={{ base: "column", sm: "row" }}>
                <TextInput
                  label="Contact Email"
                  type="email"
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
          </Stack>

          <Stack w={310} gap="md" visibleFrom="lg" pos="sticky" top={80}>
            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Group gap="xs" mb="sm">
                <IconEye size={17} color="var(--mantine-color-navy-7)" />
                <Text size="sm" fw={800}>
                  Live Preview
                </Text>
              </Group>
              <MiniPreviewCard draft={draft} previewTags={previewTags} />
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Updates as you type.
              </Text>
            </Card>

            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Stack gap="xs">
                <Button
                  color="navy"
                  leftSection={<IconSend size={16} />}
                  onClick={handlePublish}
                  loading={isPending}
                  disabled={
                    draft.title.trim().length === 0 ||
                    !hasPublishableDescription
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

type SearchOption = {
  id: number | null;
  name: string;
};

function mergeLabels(current: Record<string, string>, results: SearchOption[]) {
  if (results.length === 0) {
    return current;
  }

  const next = { ...current };
  for (const result of results) {
    if (result.id === null) {
      continue;
    }
    next[String(result.id)] = result.name;
  }
  return next;
}

function buildSelectOptions(
  results: SearchOption[],
  selectedIds: string[],
  labelsById: Record<string, string>,
) {
  const options = new Map<string, string>();

  for (const id of selectedIds) {
    const label = labelsById[id];
    if (label) {
      options.set(id, label);
    }
  }

  for (const result of results) {
    if (result.id === null) {
      continue;
    }
    options.set(String(result.id), result.name);
  }

  return Array.from(options, ([value, label]) => ({ value, label }));
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

function MiniPreviewCard({
  draft,
  previewTags,
}: {
  draft: JobDraft;
  previewTags: string[];
}) {
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
          {formatJobTypeLabel(draft.type)}
        </Button>
        <Button
          size="compact-xs"
          variant="light"
          color={draft.remote === "remote" ? "green" : "blue"}
        >
          {formatWorkModeLabel(draft.remote)}
        </Button>
      </Group>
      {previewTags.length > 0 ? (
        <Group gap={4} mt="sm">
          {previewTags.slice(0, 3).map((tag) => (
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
