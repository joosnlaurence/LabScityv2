"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBookmark,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconCurrencyDollar,
  IconExternalLink,
  IconFlag,
  IconMapPin,
  IconShare3,
  IconStar,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { type Job, SAMPLE_JOBS } from "@/components/jobs/jobs-data";

export function JobDetailsPage({ jobId }: { jobId: string }) {
  const job = SAMPLE_JOBS.find((item) => item.id === jobId) ?? SAMPLE_JOBS[0];
  const [saved, setSaved] = useState(job.saved);
  const [applied, setApplied] = useState(false);

  return (
    <Box bg="gray.0" mih="calc(100vh - 56px)">
      <Box maw={1200} mx="auto" px={{ base: "sm", md: "xl" }} py="xl">
        <Button
          component={Link}
          href="/jobs"
          variant="subtle"
          color="gray"
          mb="lg"
        >
          Back to Jobs
        </Button>

        <Flex gap="lg" align="flex-start">
          <Stack flex={1} miw={0} gap="md">
            <Card radius="md" shadow="xs" padding="xl" withBorder>
              <Group
                align="flex-start"
                justify="space-between"
                wrap="nowrap"
                mb="md"
              >
                <Box flex={1} miw={0}>
                  <Group gap="xs" mb="xs">
                    <Text component="h1" fz={26} fw={850} c="gray.9" m={0}>
                      {job.title}
                    </Text>
                    {job.badge && <JobBadge badge={job.badge} />}
                  </Group>
                  <Group gap={6} c="gray.7" mb={4}>
                    <IconBuilding
                      size={16}
                      color="var(--mantine-color-gray-5)"
                    />
                    <Text span fw={700}>
                      {job.org}
                    </Text>
                    <Text span c="gray.4">
                      -
                    </Text>
                    <IconMapPin size={15} color="var(--mantine-color-gray-5)" />
                    <Text span>{job.location}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {job.dept}
                  </Text>
                </Box>
                <ThemeIcon size={58} radius="md" color="navy">
                  <Text fw={800}>{job.org.slice(0, 3).toUpperCase()}</Text>
                </ThemeIcon>
              </Group>

              <Group gap="sm" c="gray.6" fz="sm" mb="md">
                <Fact icon={<IconBriefcase size={15} />} value={job.type} />
                <Fact
                  icon={<IconCalendar size={15} />}
                  value={`Posted ${job.posted}`}
                />
                <Fact
                  icon={<IconCurrencyDollar size={15} />}
                  value={job.salary}
                />
                <Text
                  span
                  fw={700}
                  c={job.remote === "Remote" ? "green.7" : "gray.7"}
                >
                  {job.remote}
                </Text>
                <Fact
                  icon={<IconCalendar size={15} />}
                  value={`Deadline: ${job.deadline}`}
                />
              </Group>

              <Group gap={6} mb="lg">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="light" color="gray" radius="xl">
                    {tag}
                  </Badge>
                ))}
              </Group>

              <Divider mb="md" />

              <Group gap="xs">
                <Button
                  color={applied ? "green" : "navy"}
                  leftSection={
                    applied ? (
                      <IconCheck size={16} />
                    ) : (
                      <IconExternalLink size={16} />
                    )
                  }
                  onClick={() => setApplied((current) => !current)}
                >
                  {applied ? "Applied" : "Apply Now"}
                </Button>
                <Button
                  variant={saved ? "light" : "outline"}
                  color={saved ? "navy" : "gray"}
                  leftSection={
                    <IconBookmark
                      size={16}
                      fill={saved ? "currentColor" : "none"}
                    />
                  }
                  onClick={() => setSaved((current) => !current)}
                >
                  {saved ? "Saved" : "Save Job"}
                </Button>
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={<IconShare3 size={16} />}
                >
                  Share
                </Button>
                <Button
                  ml="auto"
                  variant="subtle"
                  color="red"
                  leftSection={<IconFlag size={15} />}
                >
                  Report
                </Button>
              </Group>
            </Card>

            <Card radius="md" shadow="xs" padding="xl" withBorder>
              <JobSection title="About the Role">
                <Text size="sm" c="gray.7" lh={1.7}>
                  We are seeking a highly motivated researcher to join a
                  collaborative scientific team. The successful candidate will
                  develop new methods, work with domain experts, contribute to
                  peer-reviewed publications, and help turn research ideas into
                  durable tools.
                </Text>
              </JobSection>
              <JobSection title="Responsibilities">
                <BulletList
                  items={[
                    "Design and implement research prototypes and production-quality analysis workflows.",
                    "Collaborate with experimental partners to acquire and validate datasets.",
                    "Publish findings in relevant journals and conferences.",
                    "Mentor students and contribute to lab operations.",
                    "Support grants, reports, and community-facing research outputs.",
                  ]}
                />
              </JobSection>
              <JobSection title="Required Qualifications">
                <BulletList
                  items={[
                    "Advanced degree or equivalent research experience in a relevant field.",
                    "Strong background in computational methods, scientific programming, or experimental design.",
                    "Demonstrated ability to communicate research clearly.",
                    "Comfort working across disciplinary boundaries.",
                  ]}
                />
              </JobSection>
              <JobSection title="Research Areas & Skills">
                <Group gap={6}>
                  {[
                    ...job.tags,
                    "Python",
                    "PyTorch",
                    "Scientific Computing",
                  ].map((tag) => (
                    <Badge key={tag} variant="light" color="gray">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </JobSection>
              <JobSection title="How to Apply">
                <Text size="sm" c="gray.7" lh={1.7} mb="md">
                  Submit a CV, a short research statement, and contact
                  information for references through the organization
                  application portal.
                </Text>
                <Button
                  color="navy"
                  leftSection={<IconExternalLink size={16} />}
                >
                  Apply via External Portal
                </Button>
              </JobSection>
            </Card>
          </Stack>

          <Stack w={310} gap="md" visibleFrom="lg" pos="sticky" top={80}>
            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Text size="sm" fw={800} mb="sm">
                Quick Facts
              </Text>
              <QuickFact
                icon={<IconBuilding size={16} />}
                label="Organization"
                value={job.org}
              />
              <QuickFact
                icon={<IconBriefcase size={16} />}
                label="Employment Type"
                value={job.type}
              />
              <QuickFact
                icon={<IconMapPin size={16} />}
                label="Location"
                value={`${job.location} (${job.remote})`}
              />
              <QuickFact
                icon={<IconCalendar size={16} />}
                label="Deadline"
                value={job.deadline}
              />
              <QuickFact
                icon={<IconCurrencyDollar size={16} />}
                label="Salary"
                value={job.salary}
              />
            </Card>

            <Card radius="md" shadow="xs" padding="md" withBorder bg="blue.0">
              <Text size="sm" c="dimmed" mb="sm">
                Ready to apply?
              </Text>
              <Button
                fullWidth
                color={applied ? "green" : "navy"}
                mb="xs"
                onClick={() => setApplied((current) => !current)}
              >
                {applied ? "Applied" : "Apply Now"}
              </Button>
              <Button
                fullWidth
                variant={saved ? "light" : "outline"}
                color={saved ? "navy" : "gray"}
                onClick={() => setSaved((current) => !current)}
              >
                {saved ? "Saved" : "Save Job"}
              </Button>
            </Card>

            <Card radius="md" shadow="xs" padding="md" withBorder>
              <Text size="sm" fw={800} mb="sm">
                Similar Jobs
              </Text>
              {SAMPLE_JOBS.filter((item) => item.id !== job.id)
                .slice(0, 3)
                .map((similarJob) => (
                  <Link
                    key={similarJob.id}
                    href={`/jobs/${similarJob.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Group justify="space-between" wrap="nowrap" py={8}>
                      <Box miw={0}>
                        <Text size="sm" fw={700} c="gray.9" lineClamp={2}>
                          {similarJob.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {similarJob.org} - {similarJob.type}
                        </Text>
                      </Box>
                      <IconChevronRight
                        size={14}
                        color="var(--mantine-color-gray-5)"
                      />
                    </Group>
                  </Link>
                ))}
            </Card>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}

function Fact({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <Group gap={4}>
      {icon}
      <Text span>{value}</Text>
    </Group>
  );
}

function JobSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb="xl">
      <Text
        size="md"
        fw={800}
        mb="sm"
        pb="xs"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <Stack gap="xs">
      {items.map((item) => (
        <Group key={item} gap="sm" align="flex-start" wrap="nowrap">
          <IconCheck size={16} color="var(--mantine-color-navy-7)" />
          <Text size="sm" c="gray.7" lh={1.6}>
            {item}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Group
      gap="sm"
      align="flex-start"
      py="sm"
      wrap="nowrap"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
    >
      <Box c="gray.5" mt={2}>
        {icon}
      </Box>
      <Box>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {label}
        </Text>
        <Text size="sm" fw={650}>
          {value}
        </Text>
      </Box>
    </Group>
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
