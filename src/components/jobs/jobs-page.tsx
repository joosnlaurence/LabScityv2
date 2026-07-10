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
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconBookmark,
  IconBriefcase,
  IconBuilding,
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconShare3,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PostRichTextContent } from "@/components/feed/post-rich-text-content";
import { getJobPreviewHtml, JOB_TYPE_OPTIONS } from "./job-display";
import type { JobViewModel } from "./job-view-model";
import { useQuery } from "@tanstack/react-query";
import { toJobViewModel } from "./job-view-model";
import type { Job } from "@/lib/types/data";

interface JobsPageProps {
  jobs: JobViewModel[];
  currentUserId: string | null;
  loadError?: string | null;
}

export function JobsPage({ jobs, currentUserId, loadError }: JobsPageProps) {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<string | null>("All types");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [similar, setSimilar] = useState(false);
  const [sortByRelevance, setSortByRelevance] = useState(false);

  const recommendedQuery = useQuery({
    queryKey: ["jobs", "recommended"],
      queryFn: async () => {
        const res = await fetch("/api/jobs/recommendations");
        if (!res.ok) {
          throw new Error(`Failed to recommended jobs: ${res.status}`);
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error);
        }
        return (json.data ?? []).map((job: Job) => toJobViewModel(job));
      },
      enabled: sortByRelevance,
  });

  const displayJobs = sortByRelevance ? (recommendedQuery.data ?? []) : jobs;

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return displayJobs.filter((job: JobViewModel) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.org.toLowerCase().includes(normalizedSearch) ||
        job.dept.toLowerCase().includes(normalizedSearch) ||
        job.description.toLowerCase().includes(normalizedSearch);
      const matchesType = jobType === "All types" || job.type === jobType;
      const matchesRemote = !remoteOnly || job.remote === "Remote";
      const matchesProfile = !similar || job.remote !== "On-site";

      return matchesSearch && matchesType && matchesRemote && matchesProfile;
    });
  }, [jobType, displayJobs , remoteOnly, search, similar]);

  const myPostings = useMemo(() => {
    if (!currentUserId) return [];
    return jobs.filter((job) => job.posterId === currentUserId);
  }, [currentUserId, jobs]);

  return (
    <Box bg="gray.0" mih="calc(100vh - 56px)">
      <Box maw={1320} mx="auto" px={{ base: "sm", md: "xl" }} py="xl">
        <Group justify="space-between" align="flex-end" mb="lg">
          <Box>
            <Text component="h1" fz={28} fw={800} c="gray.9" m={0}>
              Jobs
            </Text>
            <Text size="sm" c="dimmed">
              Discover research, academic, and industry opportunities.
            </Text>
          </Box>
          <Button
            component={Link}
            href="/jobs/new"
            leftSection={<IconPlus size={16} />}
            color="navy"
            radius="md"
          >
            Post a Job
          </Button>
        </Group>

        <Card radius="md" shadow="xs" padding="md" withBorder mb="lg">
          <Flex gap="sm" align="center" wrap="wrap">
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search jobs, organizations, or departments..."
              leftSection={<IconSearch size={16} />}
              radius="md"
              style={{ flex: "1 1 280px" }}
            />
            <Select
              value={jobType}
              onChange={setJobType}
              data={[
                "All types",
                ...JOB_TYPE_OPTIONS.map((option) => option.label),
                "General",
              ]}
              leftSection={<IconBriefcase size={16} />}
              rightSection={<IconChevronDown size={16} />}
              w={180}
            />
            <Checkbox
              checked={remoteOnly}
              onChange={(event) => setRemoteOnly(event.currentTarget.checked)}
              label="Remote only"
            />
            <Checkbox
              checked={similar}
              onChange={(event) => setSimilar(event.currentTarget.checked)}
              label="Flexible work modes"
              color="violet"
            />
            <Button
              variant="outline"
              color="gray"
              leftSection={<IconAdjustmentsHorizontal size={16} />}
              ml="auto"
              disabled
            >
              More filters
            </Button>
          </Flex>
        </Card>

        <Flex gap="lg" align="flex-start">
          <Stack flex={1} gap="md" miw={0}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {filtered.length} results
              </Text>
              <Button
                variant="subtle"
                color={sortByRelevance ? "navy" : "gray"}
                size="compact-sm"
                rightSection={<IconChevronDown size={14} />}
                onClick={() => setSortByRelevance((prev) => !prev)}
              >
                Sort: Relevance
              </Button>
            </Group>

            {loadError ? (
              <Card radius="md" shadow="xs" padding="lg" withBorder>
                <Text fw={700} c="red.7">
                  {loadError}
                </Text>
              </Card>
            ) : null}

            {!loadError && filtered.length === 0 ? (
              <Card radius="md" shadow="xs" padding="lg" withBorder>
                <Text fw={700} c="gray.8">
                  No jobs found
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Try a broader search, or post the first listing for this area.
                </Text>
              </Card>
            ) : null}

            {filtered.map((job: JobViewModel) => (
              <JobCard key={job.id} job={job} />
            ))}

            <Button variant="default" radius="md" disabled>
              Load more jobs
            </Button>
          </Stack>

          <Stack w={300} gap="md" visibleFrom="lg">
            <SidebarCard title="Recent Jobs" icon={<IconBookmark size={17} />}>
              {jobs.slice(0, 3).map((job) => (
                <SidebarRow
                  key={job.id}
                  title={job.title}
                  subtitle={job.org}
                  href={`/jobs/${job.id}`}
                />
              ))}
            </SidebarCard>

            <SidebarCard
              title="Your Postings"
              icon={<IconBuilding size={17} />}
            >
              {myPostings.length > 0 ? (
                myPostings
                  .slice(0, 3)
                  .map((job) => (
                    <SidebarRow
                      key={job.id}
                      title={job.title}
                      subtitle={job.org}
                      href={`/jobs/${job.id}`}
                    />
                  ))
              ) : (
                <Text size="sm" c="dimmed">
                  Post a job to see your listings here.
                </Text>
              )}
              <Button
                component={Link}
                href="/jobs/new"
                mt="sm"
                fullWidth
                variant="outline"
                color="gray"
                leftSection={<IconPlus size={15} />}
              >
                Post a new job
              </Button>
            </SidebarCard>

            <SidebarCard
              title="Trending Fields"
              icon={<IconTrendingUp size={17} />}
            >
              <Group gap={6}>
                {[
                  "Deep Learning",
                  "Holography",
                  "Phase Imaging",
                  "Computational Imaging",
                  "Scientific Software",
                ].map((tag) => (
                  <Badge key={tag} variant="light" color="gray" radius="xl">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </SidebarCard>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}

export function JobCard({ job }: { job: JobViewModel }) {
  const [saved, setSaved] = useState(false);

  return (
    <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
      <Group align="flex-start" justify="space-between" gap="md" wrap="nowrap">
        <Box flex={1} miw={0}>
          <Text
            component={Link}
            href={`/jobs/${job.id}`}
            fz="md"
            fw={800}
            c="gray.9"
            style={{ textDecoration: "none" }}
          >
            {job.title}
          </Text>

          <Group gap={6} c="gray.7" fz="sm" mb={2} mt={4}>
            <IconBuilding size={15} color="var(--mantine-color-gray-5)" />
            <Text span fw={600}>
              {job.org}
            </Text>
            <Text span c="gray.4">
              -
            </Text>
            <IconMapPin size={14} color="var(--mantine-color-gray-5)" />
            <Text span>{job.location}</Text>
          </Group>

          <Text size="xs" c="dimmed" mb="sm">
            {job.dept}
          </Text>

          <Group gap={6} c="gray.6" fz="xs" mb="sm">
            <IconBriefcase size={14} />
            <Text span>{job.type}</Text>
            <Text span c="gray.4">
              -
            </Text>
            <Text span>Posted {job.posted}</Text>
            <Text span c="gray.4">
              -
            </Text>
            <Text
              span
              fw={600}
              c={job.remote === "Remote" ? "green.7" : "gray.7"}
            >
              {job.remote}
            </Text>
          </Group>

          <Box mb="sm">
            <PostRichTextContent
              html={getJobPreviewHtml(job.summary, job.description)}
              maxHeight={52}
            />
          </Box>

          <Badge variant="light" color="gray" radius="xl" mb="md">
            {job.remote}
          </Badge>

          <Group gap="xs">
            <Button
              component={Link}
              href={`/jobs/${job.id}`}
              color="navy"
              radius="md"
              rightSection={<IconChevronRight size={15} />}
            >
              View Details
            </Button>
            {job.applyUrl ? (
              <Button
                component={Link}
                href={job.applyUrl}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                color="gray"
                radius="md"
                leftSection={<IconExternalLink size={15} />}
              >
                Apply
              </Button>
            ) : (
              <Button
                variant="outline"
                color="gray"
                radius="md"
                leftSection={<IconExternalLink size={15} />}
                disabled
              >
                Apply
              </Button>
            )}
            <Button
              variant={saved ? "light" : "outline"}
              color={saved ? "navy" : "gray"}
              radius="md"
              leftSection={
                <IconBookmark
                  size={15}
                  fill={saved ? "currentColor" : "none"}
                />
              }
              onClick={() => setSaved((current) => !current)}
            >
              {saved ? "Saved" : "Save"}
            </Button>
            <Button ml="auto" variant="subtle" color="gray" px="xs" disabled>
              <IconShare3 size={16} />
            </Button>
          </Group>
        </Box>
      </Group>
    </Card>
  );
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card radius="md" shadow="xs" padding="md" withBorder>
      <Group gap="xs" mb="sm">
        <ThemeIcon variant="light" color="navy" radius="md" size="sm">
          {icon}
        </ThemeIcon>
        <Text size="sm" fw={800}>
          {title}
        </Text>
      </Group>
      {children}
    </Card>
  );
}

function SidebarRow({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Group justify="space-between" wrap="nowrap" py={6}>
        <Box miw={0}>
          <Text size="sm" fw={650} c="gray.9" truncate>
            {title}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {subtitle}
          </Text>
        </Box>
        <IconChevronRight size={14} color="var(--mantine-color-gray-5)" />
      </Group>
    </Link>
  );
}
