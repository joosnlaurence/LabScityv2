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
  IconChevronRight,
  IconExternalLink,
  IconFlag,
  IconMapPin,
  IconShare3,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { PostRichTextContent } from "@/components/feed/post-rich-text-content";
import type { JobViewModel } from "./job-view-model";
import { useAuth } from "@/components/auth/use-auth";
import { useSetSavedJob } from "./use-jobs";

interface JobDetailsPageProps {
  job: JobViewModel;
  similarJobs: JobViewModel[];
}

export function JobDetailsPage({ job, similarJobs }: JobDetailsPageProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(job.isSaved);
  const setSavedJob = useSetSavedJob(user?.id ?? "");

  const handleSaveClick = () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSavedJob.mutate(
      { jobId: job.id, isSaved: nextSaved },
      {
        onError: () => setSaved(!nextSaved),
      },
    );
  };

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
                  <Text component="h1" fz={26} fw={850} c="gray.9" m={0}>
                    {job.title}
                  </Text>
                  <Group gap={6} c="gray.7" mb={4} mt="xs">
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
                <Text
                  span
                  fw={700}
                  c={job.remote === "Remote" ? "green.7" : "gray.7"}
                >
                  {job.remote}
                </Text>
              </Group>

              <Group gap={6} mb="lg">
                <Badge variant="light" color="gray" radius="xl">
                  {job.remote}
                </Badge>
                <Badge variant="light" color="gray" radius="xl">
                  {job.type}
                </Badge>
              </Group>

              <Divider mb="md" />

              <Group gap="xs">
                {job.applyUrl ? (
                  <Button
                    component={Link}
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    color="navy"
                    leftSection={<IconExternalLink size={16} />}
                  >
                    Apply Now
                  </Button>
                ) : (
                  <Button
                    color="navy"
                    leftSection={<IconExternalLink size={16} />}
                    disabled
                  >
                    Apply Now
                  </Button>
                )}
                <Button
                  variant={saved ? "light" : "outline"}
                  color={saved ? "navy" : "gray"}
                  leftSection={
                    <IconBookmark
                      size={16}
                      fill={saved ? "currentColor" : "none"}
                    />
                  }
                  disabled={!user}
                  loading={setSavedJob.isPending}
                  onClick={handleSaveClick}
                >
                  {saved ? "Saved" : "Save Job"}
                </Button>
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={<IconShare3 size={16} />}
                  disabled
                >
                  Share
                </Button>
                <Button
                  ml="auto"
                  variant="subtle"
                  color="red"
                  leftSection={<IconFlag size={15} />}
                  disabled
                >
                  Report
                </Button>
              </Group>
            </Card>

            <Card radius="md" shadow="xs" padding="xl" withBorder>
              <JobSection title="Full Description">
                <PostRichTextContent html={job.description} />
              </JobSection>

              <JobSection title="How to Apply">
                <Text size="sm" c="gray.7" lh={1.7} mb="md">
                  {job.applyUrl
                    ? "Use the external application link below to continue."
                    : "No application link has been published for this listing yet."}
                </Text>
                {job.applyUrl ? (
                  <Button
                    component={Link}
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    color="navy"
                    leftSection={<IconExternalLink size={16} />}
                  >
                    Apply via External Portal
                  </Button>
                ) : (
                  <Button
                    color="navy"
                    leftSection={<IconExternalLink size={16} />}
                    disabled
                  >
                    Apply via External Portal
                  </Button>
                )}
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
                label="Posted"
                value={job.posted}
              />
            </Card>

            <Card radius="md" shadow="xs" padding="md" withBorder bg="blue.0">
              <Text size="sm" c="dimmed" mb="sm">
                Ready to apply?
              </Text>
              {job.applyUrl ? (
                <Button
                  component={Link}
                  href={job.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  fullWidth
                  color="navy"
                  mb="xs"
                >
                  Apply Now
                </Button>
              ) : (
                <Button fullWidth color="navy" mb="xs" disabled>
                  Apply Now
                </Button>
              )}
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
              {/* {similarJobs.length > 0 ? (
                similarJobs.map((similarJob) => (
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
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  More similar jobs will appear here as additional listings are
                  posted.
                </Text>
              )} */}
              <Text size='sm' c='dimmed'>
                Similar jobs will be displayed here once the frontend for them 
                is wired up
              </Text>
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
