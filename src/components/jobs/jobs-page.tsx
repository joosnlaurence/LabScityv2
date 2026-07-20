"use client";

import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
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
import { useEffect, useMemo, useRef, useState } from "react";
import type { JobType, WorkMode } from "@/lib/constants/job";
import type { JobFilters } from "@/lib/types/jobs";
import { useAuth } from "../auth/use-auth";
import { useLocationSearch } from "../profile/use-profile-search";
import {
  getJobPreviewText,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "./job-display";
import { copyJobLink } from "./job-share";
import { type JobViewModel, toJobViewModel } from "./job-view-model";
import {
  useJobs,
  useMyJobs,
  useSetSavedJob,
  useTrendingJobTags,
} from "./use-jobs";

export function JobsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [location, setLocation] = useState("");
  const [debouncedLocation] = useDebouncedValue(location, 300);
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const locationSearchQuery = useLocationSearch(debouncedLocation);
  const locationOptions = useMemo(
    () => (locationSearchQuery.data ?? []).map((result) => result.display_name),
    [locationSearchQuery.data],
  );

  const filters = useMemo<JobFilters>(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      location: debouncedLocation.trim() || undefined,
      job_type: jobType ?? undefined,
      work_mode: workMode ?? undefined,
    };
  }, [debouncedLocation, debouncedSearch, jobType, workMode]);

  const { user } = useAuth();
  const currentUserId = user?.id;

  const jobsQuery = useJobs(filters);
  const myJobsQuery = useMyJobs(!!currentUserId);
  const trendingJobTagsQuery = useTrendingJobTags();
  const setSavedJob = useSetSavedJob(currentUserId ?? "");

  const jobs = useMemo(
    () => (jobsQuery.data?.pages.flat() ?? []).map(toJobViewModel),
    [jobsQuery.data],
  );
  const myPostings = useMemo(
    () => (myJobsQuery.data ?? []).map(toJobViewModel),
    [myJobsQuery.data],
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !jobsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          jobsQuery.hasNextPage &&
          !jobsQuery.isFetchingNextPage
        ) {
          void jobsQuery.fetchNextPage();
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    jobsQuery.fetchNextPage,
    jobsQuery.hasNextPage,
    jobsQuery.isFetchingNextPage,
  ]);

  return (
    <Box mih="calc(100vh - 56px)">
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
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search by job title, organization, or department..."
              leftSection={<IconSearch size={16} />}
              radius="md"
              style={{ flex: "1 1 280px" }}
            />
            <Autocomplete
              value={location}
              onChange={setLocation}
              data={locationOptions}
              placeholder="Location"
              clearable
              leftSection={<IconMapPin size={16} />}
              rightSection={
                locationSearchQuery.isFetching ? (
                  <Loader size={14} />
                ) : undefined
              }
              radius="md"
              style={{ flex: "1 1 220px" }}
            />
            <Select
              value={jobType}
              onChange={(v) => setJobType(v as JobType | null)}
              data={JOB_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Job type"
              clearable
              leftSection={<IconBriefcase size={16} />}
              rightSection={<IconChevronDown size={16} />}
              w={180}
            />
            <Select
              value={workMode}
              onChange={(v) => setWorkMode(v as WorkMode | null)}
              data={WORK_MODE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Work mode"
              clearable
              w={180}
              leftSection={<IconMapPin size={16} />}
              rightSection={<IconChevronDown size={16} />}
            />
          </Flex>
        </Card>

        <Flex gap="lg" align="flex-start">
          <Stack flex={1} gap="md" miw={0}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {jobs.length} loaded
              </Text>
            </Group>

            {jobsQuery.isError ? (
              <Card radius="md" shadow="xs" padding="lg" withBorder>
                <Text fw={700} c="red.7">
                  {jobsQuery.error?.message ?? "Failed to load jobs"}
                </Text>
              </Card>
            ) : null}

            {jobsQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : null}

            {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length === 0 ? (
              <Card radius="md" shadow="xs" padding="lg" withBorder>
                <Text fw={700} c="gray.8">
                  No jobs found
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Be the first to post a listing for this area.
                </Text>
              </Card>
            ) : null}

            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSaveClick={() =>
                  setSavedJob.mutate({ jobId: job.id, isSaved: !job.isSaved })
                }
              />
            ))}

            {jobsQuery.hasNextPage ? <Box ref={loadMoreRef} h={1} /> : null}
            {jobsQuery.isFetchingNextPage ? (
              <Group justify="center" py="md">
                <Loader size="sm" />
              </Group>
            ) : null}
          </Stack>

          <Stack w={300} gap="md" visibleFrom="lg">
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
              {trendingJobTagsQuery.isLoading ? (
                <Group justify="center" py="xs">
                  <Loader size="sm" />
                </Group>
              ) : null}

              {trendingJobTagsQuery.isError ? (
                <Text size="sm" c="dimmed">
                  Trending fields are unavailable right now.
                </Text>
              ) : null}

              {!trendingJobTagsQuery.isLoading &&
              !trendingJobTagsQuery.isError ? (
                (trendingJobTagsQuery.data?.length ?? 0) > 0 ? (
                  <Stack gap={6} align="flex-start">
                    {trendingJobTagsQuery.data?.map((tag) => (
                      <Box
                        key={tag.tag_id}
                        title={`${tag.job_count} job${
                          tag.job_count === 1 ? "" : "s"
                        }`}
                        px={10}
                        py={3}
                        style={{
                          maxWidth: "100%",
                          borderRadius: 999,
                          background: "var(--mantine-color-gray-1)",
                          border: "1px solid var(--mantine-color-gray-2)",
                        }}
                      >
                        <Text
                          component="span"
                          fz={11}
                          fw={800}
                          tt="uppercase"
                          c="gray.7"
                          lh={1.25}
                          style={{
                            display: "-webkit-box",
                            overflow: "hidden",
                            whiteSpace: "normal",
                            overflowWrap: "anywhere",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                          }}
                        >
                          {tag.name}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    Trending fields will appear after jobs are tagged.
                  </Text>
                )
              ) : null}
            </SidebarCard>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}

export function JobCard({
  job,
  onSaveClick,
}: {
  job: JobViewModel;
  onSaveClick: () => void;
}) {
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

          <Text size="sm" c="gray.7" lineClamp={3} mb="sm">
            {getJobPreviewText(job.summary, job.description)}
          </Text>

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
            {!!onSaveClick && (
              <Button
                variant={job.isSaved ? "light" : "outline"}
                color={job.isSaved ? "navy" : "gray"}
                radius="md"
                leftSection={
                  <IconBookmark
                    size={15}
                    fill={job.isSaved ? "currentColor" : "none"}
                  />
                }
                onClick={onSaveClick}
              >
                {job.isSaved ? "Saved" : "Save"}
              </Button>
            )}
            <Button
              ml="auto"
              variant="subtle"
              color="gray"
              px="xs"
              aria-label="Copy job link"
              title="Copy job link"
              onClick={() => void copyJobLink(job.id)}
            >
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
