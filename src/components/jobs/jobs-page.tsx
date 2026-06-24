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
  IconCurrencyDollar,
  IconExternalLink,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconShare3,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { type Job, SAMPLE_JOBS } from "@/components/jobs/jobs-data";

export function JobsPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<string | null>("All types");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [similar, setSimilar] = useState(false);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return SAMPLE_JOBS.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.org.toLowerCase().includes(normalizedSearch) ||
        job.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
      const matchesType = jobType === "All types" || job.type === jobType;
      const matchesRemote = !remoteOnly || job.remote === "Remote";

      return matchesSearch && matchesType && matchesRemote;
    });
  }, [jobType, remoteOnly, search]);

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
              placeholder="Search jobs, skills, or organizations..."
              leftSection={<IconSearch size={16} />}
              radius="md"
              style={{ flex: "1 1 280px" }}
            />
            <Select
              value={jobType}
              onChange={setJobType}
              data={["All types", "Postdoc", "Faculty", "PhD", "Full-time"]}
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
              label="Similar to my profile"
              color="violet"
            />
            <Button
              variant="outline"
              color="gray"
              leftSection={<IconAdjustmentsHorizontal size={16} />}
              ml="auto"
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
                color="gray"
                size="compact-sm"
                rightSection={<IconChevronDown size={14} />}
              >
                Sort: Relevance
              </Button>
            </Group>

            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            <Button variant="default" radius="md">
              Load more jobs
            </Button>
          </Stack>

          <Stack w={300} gap="md" visibleFrom="lg">
            <SidebarCard title="Saved Jobs" icon={<IconBookmark size={17} />}>
              {SAMPLE_JOBS.filter((job) => job.saved)
                .slice(0, 3)
                .map((job) => (
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
              <SidebarRow
                title="Optics Postdoc - UCF"
                subtitle="Active - 12 applicants"
                href="/jobs/computational-microscopy-postdoc"
              />
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
                  "Physics-Informed NN",
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

function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(job.saved);
  const isFeatured = job.badge === "featured";

  return (
    <Card
      radius="md"
      shadow="xs"
      padding="lg"
      withBorder
      bg={isFeatured ? "blue.0" : "white"}
      style={{
        borderColor:
          job.badge === "featured"
            ? "var(--mantine-color-blue-2)"
            : job.badge === "closing"
              ? "var(--mantine-color-yellow-3)"
              : undefined,
      }}
    >
      <Group align="flex-start" justify="space-between" gap="md" wrap="nowrap">
        <Box flex={1} miw={0}>
          <Group gap="xs" mb={4}>
            <Text
              component={Link}
              href={`/jobs/${job.id}`}
              fz="md"
              fw={800}
              c={isFeatured ? "blue.8" : "gray.9"}
              style={{ textDecoration: "none" }}
            >
              {job.title}
            </Text>
            {job.badge && <JobBadge badge={job.badge} />}
          </Group>

          <Group gap={6} c="gray.7" fz="sm" mb={2}>
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
            <IconCurrencyDollar size={14} />
            <Text span>{job.salary}</Text>
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

          <Text size="sm" c="gray.7" lineClamp={2} mb="sm">
            {job.description}
          </Text>

          <Group gap={6} mb="md">
            {job.tags.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                color={isFeatured ? "blue" : "gray"}
                radius="xl"
              >
                {tag}
              </Badge>
            ))}
          </Group>

          <Group gap="xs">
            <Button
              component={Link}
              href={`/jobs/${job.id}`}
              color={isFeatured ? "blue" : "navy"}
              radius="md"
              rightSection={<IconChevronRight size={15} />}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              color="gray"
              radius="md"
              leftSection={<IconExternalLink size={15} />}
            >
              Apply
            </Button>
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
            <Button ml="auto" variant="subtle" color="gray" px="xs">
              <IconShare3 size={16} />
            </Button>
          </Group>
        </Box>
      </Group>
    </Card>
  );
}

function JobBadge({ badge }: { badge: NonNullable<Job["badge"]> }) {
  if (badge === "featured") {
    return (
      <Badge
        color="yellow"
        variant="light"
        leftSection={<IconStar size={11} fill="currentColor" />}
      >
        Featured
      </Badge>
    );
  }

  if (badge === "closing") {
    return (
      <Badge color="red" variant="light">
        Closing soon
      </Badge>
    );
  }

  return (
    <Badge color="green" variant="light">
      New
    </Badge>
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
