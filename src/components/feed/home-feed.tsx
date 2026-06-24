"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBookmark,
  IconBriefcase,
  IconCheck,
  IconChevronRight,
  IconFileText,
  IconFolderPlus,
  IconHeart,
  IconMessageCircle,
  IconPackage,
  IconPlus,
  IconQuote,
  IconShare3,
  IconSparkles,
  IconTag,
  IconTrendingUp,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";
import type { HomeFeedProps } from "@/components/feed/home-feed.types";

const trendTags = [
  "Quantum Computing",
  "Biomedical Imaging",
  "Climate Modeling",
  "Human-Computer Interaction",
  "Machine Learning",
];

const collaborators = [
  {
    initials: "SK",
    name: "Sarah Kim",
    role: "PhD Candidate, MIT",
    field: "Medical Imaging",
    match: "96%",
    color: "violet",
    open: true,
  },
  {
    initials: "CW",
    name: "Cheng Wu",
    role: "Research Scientist, UCF",
    field: "Optics",
    match: "91%",
    color: "cyan",
    open: false,
  },
  {
    initials: "DP",
    name: "David Park",
    role: "Postdoc, Stanford",
    field: "Holography",
    match: "88%",
    color: "green",
    open: true,
  },
];

const publications = [
  {
    title: "Self-supervised denoising for live-cell fluorescence microscopy",
    authors: "L. Tanaka, R. Singh",
    venue: "Nature Methods - 2026",
    tags: ["Microscopy", "Self-Supervised"],
  },
  {
    title: "Diffusion models for accelerated MRI reconstruction",
    authors: "A. Petrov, M. Chen, +2",
    venue: "MICCAI - 2026",
    tags: ["Medical Imaging", "Diffusion"],
  },
  {
    title: "Benchmarking physics-informed networks on PDE inverse problems",
    authors: "K. Nowak, J. Riley",
    venue: "ICLR - 2026",
    tags: ["Physics-Informed NN", "Benchmark"],
  },
];

const products = [
  {
    title: "CryoTrace - automated cryo-EM particle picking",
    contributor: "Helix Bio Lab",
    tags: ["Cryo-EM", "Automation"],
    color: "cyan",
  },
  {
    title: "ClimaGrid - high-resolution climate downscaling models",
    contributor: "EarthScale Collective",
    tags: ["Climate Modeling", "ML"],
    color: "green",
  },
  {
    title: "RoboGrasp SDK - dexterous manipulation primitives",
    contributor: "Mecha Robotics Group",
    tags: ["Robotics", "Manipulation"],
    color: "violet",
  },
];

export function HomeFeed(_props?: Partial<HomeFeedProps>) {
  const isMobile = useIsMobile();

  return (
    <Box bg="gray.0" mih="calc(100vh - 56px)">
      <Flex
        maw={1320}
        mx="auto"
        px={{ base: "sm", md: "lg" }}
        py={{ base: "md", md: "xl" }}
        gap="lg"
        align="flex-start"
      >
        {!isMobile && <HomeLeftRail />}

        <Stack flex={1} miw={0} gap="lg" maw={760} mx="auto">
          <CreatePostCard />
          <FeaturedPublicationPost />
          <RecommendedProductPost />
          <CollaborationRequestPost />
          <CompactPublicationsCluster />
          <ProductDiscoveryCluster />
          <PeopleSpotlight />
        </Stack>

        {!isMobile && <HomeRightRail />}
      </Flex>
    </Box>
  );
}

function CreatePostCard() {
  const [tags, setTags] = useState(["Publications", "Products"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((item) => item !== tag));
  };

  const addTag = (tag: string) => {
    setTags((current) => (current.includes(tag) ? current : [...current, tag]));
  };

  return (
    <>
      <Card radius="md" shadow="xs" padding="md" withBorder bg="white">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Avatar radius="xl" color="navy.7">
                YA
              </Avatar>
              <Box>
                <Text size="sm" fw={800} c="gray.8">
                  What are you working on?
                </Text>
                <Text size="xs" c="dimmed">
                  Share a paper, product, result, or collaboration note.
                </Text>
              </Box>
            </Group>
            <Button
              leftSection={<IconPlus size={15} />}
              radius="md"
              c="gray.0"
              fw={700}
              bg="navy.8"
            >
              New Post
            </Button>
          </Group>

          <Divider />

          <Group gap="xs">
            <Text size="xs" fw={800} c="gray.5" tt="uppercase">
              Show
            </Text>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="light"
                color={tag === "Collaborations" ? "teal" : "blue"}
                radius="xl"
                leftSection={<IconTag size={10} />}
                rightSection={
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    size={14}
                    onClick={() => removeTag(tag)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                {tag}
              </Badge>
            ))}
            <Button
              variant="outline"
              color="teal"
              radius="xl"
              size="compact-xs"
              leftSection={<IconPlus size={13} />}
              onClick={() => setModalOpen(true)}
            >
              Add Tags
            </Button>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Filter feed by tags"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Add topics to tune this example feed.
          </Text>
          <Group gap="xs">
            {[
              "Optics",
              "Computer Vision",
              "Neural Networks",
              "Microscopy",
              "Machine Learning",
              "Biomedical Imaging",
              "Climate Modeling",
              "Robotics",
              "Collaborations",
            ].map((tag) => (
              <Button
                key={tag}
                variant={tags.includes(tag) ? "filled" : "light"}
                color={tags.includes(tag) ? "navy" : "gray"}
                radius="xl"
                size="compact-sm"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </Group>
          <Group>
            <TextInput
              value={customTag}
              onChange={(event) => setCustomTag(event.currentTarget.value)}
              placeholder="Custom tag"
              style={{ flex: 1 }}
            />
            <Button
              color="navy"
              onClick={() => {
                const nextTag = customTag.trim();
                if (nextTag) addTag(nextTag);
                setCustomTag("");
              }}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

function FeaturedPublicationPost() {
  const [saved, setSaved] = useState(false);

  return (
    <Stack gap="xs">
      <FeedHeader
        avatar={{ initials: "YA", color: "navy" }}
        text="Dr. Yara Adeyemi highlighted a publication"
        sub="2h ago"
      />
      <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <ThemeIcon size={46} radius="md" color="blue" variant="light">
              <IconFileText size={22} />
            </ThemeIcon>
            <Badge
              variant="light"
              color="teal"
              leftSection={<IconSparkles size={11} />}
            >
              Recommended for your research
            </Badge>
          </Group>
          <Box>
            <Text fz="lg" fw={850} c="gray.9" lh={1.25}>
              Physics-informed self-supervised segmentation for high-throughput
              microscopy
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              S. Kim, Y. Adeyemi, M. Patel - Nature Methods - 2026
            </Text>
          </Box>
          <Text size="sm" c="gray.7" lh={1.6}>
            A lightweight model that combines optical priors with
            self-supervised denoising to reduce annotation requirements in
            live-cell fluorescence microscopy.
          </Text>
          <Group gap={6}>
            {["Microscopy", "Self-Supervised", "Computer Vision"].map((tag) => (
              <Badge key={tag} variant="light" color="blue" radius="xl">
                {tag}
              </Badge>
            ))}
          </Group>
          <Divider />
          <Group gap="xs">
            <Button
              variant={saved ? "light" : "subtle"}
              color={saved ? "navy" : "gray"}
              leftSection={
                <IconBookmark
                  size={16}
                  fill={saved ? "currentColor" : "none"}
                />
              }
              onClick={() => setSaved((current) => !current)}
            >
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconQuote size={16} />}
            >
              Cite
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconShare3 size={16} />}
            >
              Share
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

function RecommendedProductPost() {
  const [liked, setLiked] = useState(false);

  return (
    <Stack gap="xs">
      <FeedHeader
        text="LabScity found a research product matching your tags"
        sub="Today"
        badge="91% match"
      />
      <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
        <Stack gap="md">
          <Group align="flex-start" wrap="nowrap">
            <ThemeIcon size={52} radius="md" color="teal" variant="light">
              <IconPackage size={24} />
            </ThemeIcon>
            <Box flex={1} miw={0}>
              <Text fz="md" fw={850} c="gray.9">
                MicroLens Studio
              </Text>
              <Text size="sm" c="dimmed">
                Open-source toolkit for microscopy reconstruction workflows
              </Text>
            </Box>
            <Button size="compact-sm" color="navy">
              View
            </Button>
          </Group>
          <Text size="sm" c="gray.7" lh={1.6}>
            Build and compare phase retrieval, denoising, and segmentation
            pipelines from a single notebook-friendly interface.
          </Text>
          <Group gap={6}>
            {["Python", "Microscopy", "Open Source"].map((tag) => (
              <Badge key={tag} variant="light" color="gray" radius="xl">
                {tag}
              </Badge>
            ))}
          </Group>
          <Divider />
          <Group gap="xs">
            <Button
              variant={liked ? "light" : "subtle"}
              color={liked ? "red" : "gray"}
              leftSection={
                <IconHeart size={16} fill={liked ? "currentColor" : "none"} />
              }
              onClick={() => setLiked((current) => !current)}
            >
              {liked ? "Liked" : "Like"}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconMessageCircle size={16} />}
            >
              Comment
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconShare3 size={16} />}
            >
              Share
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

function CollaborationRequestPost() {
  const [following, setFollowing] = useState(false);

  return (
    <Stack gap="xs">
      <FeedHeader
        avatar={{ initials: "AL", color: "pink" }}
        text="Ann Lee is looking for collaborators"
        sub="1d ago"
      />
      <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
        <Stack gap="md">
          <Group align="flex-start" wrap="nowrap">
            <Avatar size={54} radius="xl" color="pink">
              AL
            </Avatar>
            <Box flex={1} miw={0}>
              <Group gap="xs">
                <Text fw={850} c="gray.9">
                  Ann Lee
                </Text>
                <Badge color="green" variant="light">
                  Open to collaborate
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Postdoctoral Fellow - Johns Hopkins
              </Text>
            </Box>
            <Button
              color={following ? "green" : "navy"}
              leftSection={
                following ? <IconCheck size={15} /> : <IconUserPlus size={15} />
              }
              onClick={() => setFollowing((current) => !current)}
            >
              {following ? "Following" : "Follow"}
            </Button>
          </Group>
          <Text size="sm" c="gray.7" lh={1.6}>
            We are building a small benchmark for label-efficient microscopy
            segmentation and need partners with varied acquisition setups. Happy
            to share early code and co-author results.
          </Text>
          <Group gap={6}>
            {["Microscopy", "Genomics", "Segmentation"].map((tag) => (
              <Badge key={tag} variant="light" color="gray" radius="xl">
                {tag}
              </Badge>
            ))}
          </Group>
          <Divider />
          <Group gap="xs">
            <Button color="teal" leftSection={<IconMessageCircle size={16} />}>
              Collaborate
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconShare3 size={16} />}
            >
              Share
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

function CompactPublicationsCluster() {
  return (
    <SectionCard
      title="New publications in your research areas"
      icon={<IconFileText size={18} />}
      actionLabel="View more"
    >
      <Stack gap={0}>
        {publications.map((publication) => (
          <PublicationRow key={publication.title} publication={publication} />
        ))}
      </Stack>
    </SectionCard>
  );
}

function PublicationRow({
  publication,
}: {
  publication: (typeof publications)[number];
}) {
  const [saved, setSaved] = useState(false);

  return (
    <Group
      py="sm"
      wrap="nowrap"
      align="flex-start"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
    >
      <ThemeIcon variant="light" color="blue" radius="md" size={40}>
        <IconFileText size={18} />
      </ThemeIcon>
      <Box flex={1} miw={0}>
        <Text size="sm" fw={800} c="gray.9" lineClamp={2}>
          {publication.title}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {publication.authors} - {publication.venue}
        </Text>
        <Group gap={5} mt={6}>
          {publication.tags.map((tag) => (
            <Badge key={tag} variant="light" color="gray" radius="xl">
              {tag}
            </Badge>
          ))}
        </Group>
      </Box>
      <ActionIcon
        variant="subtle"
        color={saved ? "navy" : "gray"}
        onClick={() => setSaved((current) => !current)}
      >
        <IconBookmark size={17} fill={saved ? "currentColor" : "none"} />
      </ActionIcon>
    </Group>
  );
}

function ProductDiscoveryCluster() {
  return (
    <SectionCard
      title="Research tools gaining traction"
      icon={<IconTrendingUp size={18} />}
      actionLabel="Explore"
      accent="teal"
    >
      <Stack gap={0}>
        {products.map((product) => (
          <Group
            key={product.title}
            py="sm"
            wrap="nowrap"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
          >
            <ThemeIcon
              variant="light"
              color={product.color}
              radius="md"
              size={42}
            >
              <IconPackage size={18} />
            </ThemeIcon>
            <Box flex={1} miw={0}>
              <Text size="sm" fw={800} c="gray.9" truncate>
                {product.title}
              </Text>
              <Group gap={5} mt={4}>
                <Text size="xs" c="dimmed">
                  {product.contributor}
                </Text>
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="light" color="gray" radius="xl">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Box>
            <Button size="compact-sm" color="navy">
              View
            </Button>
          </Group>
        ))}
      </Stack>
    </SectionCard>
  );
}

function PeopleSpotlight() {
  return (
    <SectionCard
      title="Collaborators you may want to meet"
      icon={<IconUsers size={18} />}
      actionLabel="See all"
    >
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={0}>
        {collaborators.map((person) => (
          <SpotlightPerson key={person.name} person={person} />
        ))}
      </SimpleGrid>
    </SectionCard>
  );
}

function SpotlightPerson({
  person,
}: {
  person: (typeof collaborators)[number];
}) {
  const [following, setFollowing] = useState(false);

  return (
    <Stack align="center" gap={7} p="md" ta="center">
      <Avatar size={54} radius="xl" color={person.color}>
        {person.initials}
      </Avatar>
      <Box>
        <Text size="sm" fw={850}>
          {person.name}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {person.role}
        </Text>
      </Box>
      <Badge size="sm" color="green" variant="light">
        {person.match} match
      </Badge>
      {person.open && (
        <Badge size="xs" color="teal" variant="light">
          Open to collaborate
        </Badge>
      )}
      <Button
        fullWidth
        size="compact-sm"
        color={following ? "green" : "navy"}
        leftSection={
          following ? <IconCheck size={14} /> : <IconUserPlus size={14} />
        }
        onClick={() => setFollowing((current) => !current)}
      >
        {following ? "Following" : "Follow"}
      </Button>
    </Stack>
  );
}

function HomeLeftRail() {
  return (
    <Stack w={228} gap="md" pos="sticky" top={80}>
      <Card radius="md" shadow="xs" padding="md" withBorder>
        <Stack align="center" gap={8}>
          <Avatar size={58} radius="xl" color="navy.7">
            YA
          </Avatar>
          <Text ta="center" size="sm" fw={800}>
            Dr. Yara Adeyemi
          </Text>
          <Text ta="center" size="xs" c="dimmed">
            Postdoc - Computational Imaging
          </Text>
          <Text ta="center" size="xs" c="dimmed">
            Imperial College London
          </Text>
          <SimpleGrid cols={2} spacing="xs" w="100%" mt={4}>
            <Stat label="Following" value="128" />
            <Stat label="Papers" value="12" />
          </SimpleGrid>
        </Stack>
      </Card>

      <Card radius="md" shadow="xs" padding="sm" withBorder>
        <Stack gap={6}>
          <Text size="xs" fw={800} c="gray.5" tt="uppercase" px={4}>
            Quick Actions
          </Text>
          <RailButton
            icon={<IconFileText size={16} />}
            label="Add Publication"
          />
          <RailButton
            icon={<IconBriefcase size={16} />}
            label="Post Job"
            href="/jobs/new"
          />
          <RailButton
            icon={<IconFolderPlus size={16} />}
            label="Create Group"
          />
          <RailButton icon={<IconPlus size={16} />} label="New Post" />
        </Stack>
      </Card>
    </Stack>
  );
}

function HomeRightRail() {
  return (
    <Stack w={320} gap="md" pos="sticky" top={80}>
      <SectionCard
        title="Recommended Collaborators"
        icon={<IconUsers size={18} />}
        actionLabel="See all"
      >
        <Stack gap={0}>
          {collaborators.map((person) => (
            <CollaboratorRow key={person.name} person={person} />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard
        title="Trending Research"
        icon={<IconTrendingUp size={18} />}
        accent="teal"
      >
        <Stack gap={4}>
          {trendTags.map((tag, index) => (
            <Button
              key={tag}
              variant="subtle"
              color="gray"
              justify="space-between"
              px="xs"
              rightSection={<IconChevronRight size={14} />}
            >
              <Group gap="sm">
                <Text size="sm" fw={800} c="gray.4">
                  {index + 1}
                </Text>
                <Text size="sm" c="gray.8">
                  #{tag.replace(/\s/g, "")}
                </Text>
              </Group>
            </Button>
          ))}
        </Stack>
      </SectionCard>

      <SectionCard title="Popular Groups" icon={<IconUsers size={18} />}>
        <Stack gap="xs">
          {[
            "Computational Imaging Hub",
            "ML for Science",
            "Climate AI Network",
          ].map((group) => (
            <Group key={group} wrap="nowrap">
              <ThemeIcon variant="light" color="navy" radius="md">
                <IconUsers size={16} />
              </ThemeIcon>
              <Box flex={1} miw={0}>
                <Text size="sm" fw={800} truncate>
                  {group}
                </Text>
                <Text size="xs" c="dimmed">
                  Active research group
                </Text>
              </Box>
              <Button size="compact-xs" variant="outline" color="navy">
                Join
              </Button>
            </Group>
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  );
}

function CollaboratorRow({
  person,
}: {
  person: (typeof collaborators)[number];
}) {
  const [following, setFollowing] = useState(false);

  return (
    <Group
      py="sm"
      wrap="nowrap"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
    >
      <Avatar color={person.color} radius="xl">
        {person.initials}
      </Avatar>
      <Box flex={1} miw={0}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={800} truncate>
            {person.name}
          </Text>
          {person.open && (
            <Badge size="xs" color="green" variant="light">
              Open
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed" truncate>
          {person.field}
        </Text>
        <Badge size="xs" color="green" variant="light" mt={4}>
          {person.match} match
        </Badge>
      </Box>
      <ActionIcon
        variant="filled"
        color={following ? "green" : "navy"}
        radius="md"
        size="sm"
        onClick={() => setFollowing((current) => !current)}
      >
        {following ? <IconCheck size={14} /> : <IconUserPlus size={14} />}
      </ActionIcon>
    </Group>
  );
}

function FeedHeader({
  avatar,
  text,
  sub,
  badge,
}: {
  avatar?: { initials: string; color: string };
  text: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <Group gap="sm" px={4}>
      {avatar ? (
        <Avatar size={30} radius="xl" color={avatar.color}>
          {avatar.initials}
        </Avatar>
      ) : (
        <ThemeIcon variant="light" color="teal" radius="xl" size={30}>
          <IconSparkles size={15} />
        </ThemeIcon>
      )}
      <Text size="xs" c="dimmed" flex={1}>
        <Text span fw={700} c="gray.7">
          {text}
        </Text>
        {sub ? ` - ${sub}` : ""}
      </Text>
      {badge && (
        <Badge size="sm" color="green" variant="light">
          {badge}
        </Badge>
      )}
    </Group>
  );
}

function SectionCard({
  title,
  icon,
  actionLabel,
  accent = "navy",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  actionLabel?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <Card radius="md" shadow="xs" padding="md" withBorder bg="white">
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <ThemeIcon variant="light" color={accent} radius="md" size="sm">
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={850}>
            {title}
          </Text>
        </Group>
        {actionLabel && (
          <Button
            variant="subtle"
            color="blue"
            size="compact-xs"
            rightSection={<IconChevronRight size={12} />}
          >
            {actionLabel}
          </Button>
        )}
      </Group>
      {children}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box ta="center">
      <Text size="md" fw={850}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Box>
  );
}

function RailButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const content = (
    <Group gap="sm" wrap="nowrap" w="100%">
      <ThemeIcon variant="light" color="navy" radius="md" size="sm">
        {icon}
      </ThemeIcon>
      <Text size="sm" fw={650}>
        {label}
      </Text>
      <IconChevronRight size={14} style={{ marginLeft: "auto" }} />
    </Group>
  );

  if (href) {
    return (
      <Button
        component={Link}
        href={href}
        variant="subtle"
        color="gray"
        justify="flex-start"
      >
        {content}
      </Button>
    );
  }

  return (
    <Button variant="subtle" color="gray" justify="flex-start">
      {content}
    </Button>
  );
}
