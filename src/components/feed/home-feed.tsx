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
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBookmark,
  IconBriefcase,
  IconChevronRight,
  IconDots,
  IconFileText,
  IconFolderPlus,
  IconHeart,
  IconLink,
  IconMessageCircle,
  IconPlus,
  IconQuote,
  IconShare3,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";
import { LSPopularGroupsHomeStrip } from "@/components/groups/ls-popular-groups-home-strip";
import type { GetCollaboratorsResult } from "@/lib/types/collab";
import type { CreatePostValues } from "@/lib/validations/post";
import type { HomeFeedProps } from "./home-feed.types";
import { PostFollowButton } from "./post-follow-button";
import { useHomeFeed } from "./use-home-feed";

export function HomeFeed(props: HomeFeedProps) {
  const isMobile = useIsMobile();
  const {
    posts,
    isFeedLoading,
    isFeedError,
    feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    activeCommentPostId,
    setActiveCommentPostId,
    isComposerOpen,
    setIsComposerOpen,
    createPostMutation,
    handleSubmitPost,
    handleAddComment,
    handleTogglePostLike,
    handleDeletePost,
    currentUserId,
  } = useHomeFeed(props);

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
        {!isMobile ? <HomeLeftRail {...props} /> : null}

        <Stack flex={1} miw={0} gap="lg" maw={760} mx="auto">
          <CreatePostCard
            isComposerOpen={isComposerOpen}
            onToggleComposer={() => setIsComposerOpen((current) => !current)}
            onSubmit={handleSubmitPost}
            isPending={createPostMutation.isPending}
          />

          {isFeedLoading && posts.length === 0 ? (
            <Text c="dimmed">Loading feed...</Text>
          ) : null}

          {isFeedError ? (
            <Text c="red.7">
              {feedError instanceof Error
                ? feedError.message
                : "Failed to fetch feed"}
            </Text>
          ) : null}

          {!isFeedLoading && !isFeedError && posts.length === 0 ? (
            <Card radius="md" shadow="xs" padding="lg" withBorder bg="white">
              <Text fw={800} c="gray.8">
                Your home feed is empty
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Create the first post or explore groups and collaborators to
                start building your network.
              </Text>
            </Card>
          ) : null}

          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              currentUserId={currentUserId}
              post={post}
              commentOpen={activeCommentPostId === post.id}
              onToggleComments={() =>
                setActiveCommentPostId((current) =>
                  current === post.id ? null : post.id,
                )
              }
              onAddComment={handleAddComment}
              onLike={() => handleTogglePostLike(post.id)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}

          {hasNextPage ? (
            <Button
              variant="default"
              radius="md"
              onClick={() => void fetchNextPage()}
              loading={isFetchingNextPage}
            >
              Load more posts
            </Button>
          ) : null}
        </Stack>

        {!isMobile ? <HomeRightRail {...props} /> : null}
      </Flex>
    </Box>
  );
}

function CreatePostCard({
  isComposerOpen,
  onToggleComposer,
  onSubmit,
  isPending,
}: {
  isComposerOpen: boolean;
  onToggleComposer: () => void;
  onSubmit: (values: CreatePostValues & { mediaFile?: File | null }) => void;
  isPending: boolean;
}) {
  const [draftField, setDraftField] = useState("");
  const [draftContent, setDraftContent] = useState("");

  return (
    <Card
      radius="xl"
      padding="md"
      withBorder
      bg="white"
      style={{
        borderColor: "#E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Avatar radius="xl" color="navy.7" size={36}>
              YA
            </Avatar>
            <Box>
              <Text size="sm" fw={800} c="#374151">
                What&apos;s on your mind?
              </Text>
              <Text size="xs" c="#64748B">
                Share a paper, product, result, or collaboration note.
              </Text>
            </Box>
          </Group>
          <Button
            leftSection={<IconPlus size={15} />}
            radius="md"
            c="white"
            fw={700}
            bg="#1F3A5F"
            onClick={onToggleComposer}
          >
            New Post
          </Button>
        </Group>

        {isComposerOpen ? (
          <Stack gap="sm" pt="md" style={{ borderTop: "1px solid #F3F4F6" }}>
            <Textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.currentTarget.value)}
              minRows={4}
              autosize
              placeholder="Share an update with the community..."
              styles={{
                input: {
                  borderRadius: 14,
                  borderColor: "#E5E7EB",
                  fontSize: 14,
                },
              }}
            />
            <Textarea
              value={draftField}
              onChange={(event) => setDraftField(event.currentTarget.value)}
              minRows={1}
              autosize
              placeholder="Scientific field, e.g. Microscopy"
              styles={{
                input: {
                  borderRadius: 14,
                  borderColor: "#E5E7EB",
                  fontSize: 14,
                },
              }}
            />
            <Group justify="space-between" wrap="wrap">
              <Group gap="xs">
                <Badge
                  variant="light"
                  radius="xl"
                  color="blue"
                  style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                >
                  Publications
                </Badge>
                <Badge
                  variant="light"
                  radius="xl"
                  color="blue"
                  style={{ background: "#EEF2FF", color: "#1D4ED8" }}
                >
                  Products
                </Badge>
              </Group>
              <Button
                color="navy"
                radius="md"
                loading={isPending}
                disabled={
                  draftContent.trim().length === 0 ||
                  draftField.trim().length === 0
                }
                onClick={() => {
                  onSubmit({
                    content: draftContent,
                    scientificField: draftField,
                    category: "general",
                  });
                  setDraftContent("");
                  setDraftField("");
                }}
              >
                Publish Post
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}

function FeedPostCard({
  post,
  currentUserId,
  commentOpen,
  onToggleComments,
  onAddComment,
  onLike,
  onDelete,
}: {
  post: {
    id: string;
    userId: string;
    userName: string;
    avatarUrl?: string | null;
    scientificField: string;
    content: string;
    timeAgo: string;
    mediaUrl?: string | null;
    mediaWidth?: number;
    mediaHeight?: number;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      avatarUrl?: string | null;
      content: string;
      timeAgo: string;
    }>;
    isLiked?: boolean;
    likeCount?: number;
  };
  currentUserId: string | null;
  commentOpen: boolean;
  onToggleComments: () => void;
  onAddComment: (postId: string, values: { content: string }) => Promise<void>;
  onLike: () => void;
  onDelete: () => void;
}) {
  const isOwnPost = currentUserId != null && currentUserId === post.userId;
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const title = deriveTitle(post.content);
  const description = deriveDescription(post.content);

  return (
    <Card
      radius="xl"
      withBorder
      bg="white"
      p="lg"
      style={{
        borderColor: "#E5E7EB",
        borderTop: "3px solid #2563EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            {isOwnPost ? (
              <Badge
                radius="xl"
                variant="light"
                style={{
                  background: "#EEF2FF",
                  color: "#1D4ED8",
                  border: "1px solid #C7D2FE",
                }}
              >
                Your Post
              </Badge>
            ) : null}
            <Badge
              radius="xl"
              variant="light"
              color="yellow"
              leftSection={<IconPlus size={10} />}
              style={{
                background: "#FEF3C7",
                color: "#B45309",
                border: "1px solid #FCD34D",
              }}
            >
              Featured
            </Badge>
            <Badge
              radius="xl"
              variant="light"
              color="blue"
              leftSection={<IconFileText size={10} />}
              style={{
                background: "#EFF6FF",
                color: "#2563EB",
                border: "1px solid #BFDBFE",
              }}
            >
              Article
            </Badge>
            <Badge
              radius="xl"
              variant="light"
              color="blue"
              style={{
                background: "#EEF2FF",
                color: "#1D4ED8",
                border: "1px solid #C7D2FE",
              }}
            >
              {post.scientificField}
            </Badge>
          </Group>
          <ActionIcon variant="subtle" color="gray" disabled={!isOwnPost}>
            <IconDots size={18} />
          </ActionIcon>
        </Group>

        <Stack gap={8}>
          <Text
            component={Link}
            href={`/posts/${post.id}`}
            fw={700}
            fz={17}
            c="#111827"
            style={{ textDecoration: "none", lineHeight: 1.4 }}
          >
            {title}
          </Text>
          <Text size="sm" c="#475569" lh={1.6}>
            {description}
          </Text>
        </Stack>

        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="nowrap">
            <Avatar.Group spacing="sm">
              <Avatar size={28} src={post.avatarUrl ?? undefined} color="blue">
                {initials(post.userName)}
              </Avatar>
              <Avatar size={28} color="cyan">
                {post.scientificField.slice(0, 2).toUpperCase()}
              </Avatar>
            </Avatar.Group>
            <Text size="sm" c="#1F2937" fw={600}>
              {post.userName}
              <Text span c="#64748B" fw={400}>
                {" "}
                · {post.timeAgo}
              </Text>
            </Text>
            {!isOwnPost ? (
              <PostFollowButton
                currentUserId={currentUserId}
                targetUserId={post.userId}
              />
            ) : null}
          </Group>
          <Text size="sm" c="#2563EB">
            {copied ? "Link copied" : ""}
          </Text>
        </Group>

        <Group gap={6} wrap="wrap">
          <Button
            component={Link}
            href={`/posts/${post.id}`}
            variant="light"
            radius="xl"
            size="compact-sm"
            style={{
              background: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE",
            }}
          >
            {post.scientificField}
          </Button>
          <Button
            variant="light"
            radius="xl"
            size="compact-sm"
            style={{
              background: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE",
            }}
          >
            {post.userName.split(" ")[0]}
          </Button>
        </Group>

        {post.mediaUrl ? (
          <Box
            style={{
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
            }}
          >
            <Image
              src={post.mediaUrl}
              alt="Post attachment"
              width={post.mediaWidth ?? 1200}
              height={post.mediaHeight ?? 700}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        ) : null}

        <Divider color="#E5E7EB" />

        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="lg">
            <Button
              variant="subtle"
              color={post.isLiked ? "red" : "gray"}
              leftSection={<IconHeart size={16} />}
              px={0}
              onClick={onLike}
            >
              {post.likeCount ?? 0}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconMessageCircle size={16} />}
              px={0}
              onClick={onToggleComments}
            >
              {post.comments.length}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={
                <IconBookmark
                  size={16}
                  fill={saved ? "currentColor" : "none"}
                />
              }
              px={0}
              onClick={() => setSaved((current) => !current)}
            >
              Save
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconShare3 size={16} />}
              px={0}
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/posts/${post.id}`,
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              Share
            </Button>
          </Group>
          {isOwnPost ? (
            <Button variant="subtle" color="red" onClick={onDelete}>
              Delete
            </Button>
          ) : null}
        </Group>

        <Group gap="sm">
          <Button
            component={Link}
            href={`/posts/${post.id}`}
            radius="md"
            color="blue"
            rightSection={<IconChevronRight size={14} />}
            style={{ background: "#2563EB" }}
          >
            View
          </Button>
          <Button
            variant="outline"
            radius="md"
            color="gray"
            leftSection={<IconQuote size={15} />}
            disabled
          >
            Cite
          </Button>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconLink size={15} />}
            disabled
          >
            Link
          </Button>
        </Group>

        {commentOpen ? (
          <Stack gap="sm">
            <Divider />
            {post.comments.map((item) => (
              <Group key={item.id} align="flex-start" wrap="nowrap">
                <Avatar size="sm" radius="xl" src={item.avatarUrl ?? undefined}>
                  {initials(item.userName)}
                </Avatar>
                <Box>
                  <Text size="sm" fw={700}>
                    {item.userName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.timeAgo}
                  </Text>
                  <Text size="sm" mt={4}>
                    {item.content}
                  </Text>
                </Box>
              </Group>
            ))}
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(event) => setComment(event.currentTarget.value)}
              minRows={2}
              styles={{
                input: {
                  borderRadius: 14,
                  borderColor: "#E5E7EB",
                },
              }}
            />
            <Group justify="flex-end">
              <Button
                size="compact-sm"
                color="navy"
                loading={isSubmittingComment}
                disabled={comment.trim().length === 0}
                onClick={async () => {
                  setIsSubmittingComment(true);
                  try {
                    await onAddComment(post.id, { content: comment });
                    setComment("");
                  } finally {
                    setIsSubmittingComment(false);
                  }
                }}
              >
                Post Comment
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}

function HomeLeftRail({ currentUser }: HomeFeedProps) {
  return (
    <Stack w={228} gap="md" pos="sticky" top={80}>
      <Card radius="md" shadow="xs" padding="md" withBorder>
        <Stack align="center" gap={8}>
          <Avatar
            size={58}
            radius="xl"
            color="navy.7"
            src={currentUser?.avatar_url ?? undefined}
          >
            {initials(
              [currentUser?.first_name, currentUser?.last_name]
                .filter(Boolean)
                .join(" "),
            )}
          </Avatar>
          <Text ta="center" size="sm" fw={800}>
            {[currentUser?.first_name, currentUser?.last_name]
              .filter(Boolean)
              .join(" ") || "Your profile"}
          </Text>
          <Text ta="center" size="xs" c="dimmed">
            {currentUser?.occupation || "Researcher"}
          </Text>
          <Text ta="center" size="xs" c="dimmed">
            {currentUser?.workplace || "LabScity member"}
          </Text>
          <Button
            component={Link}
            href="/profile"
            size="compact-sm"
            variant="light"
            color="navy"
            radius="xl"
          >
            View profile
          </Button>
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

function HomeRightRail({
  currentUserId,
  trendingTags,
  searchPublicGroupsAction,
  joinGroupAction,
  getGroupsAction,
}: HomeFeedProps) {
  const collaboratorsQuery = useQuery({
    queryKey: ["home", "collaborators", currentUserId],
    queryFn: async () => {
      const res = await fetch("/api/collaborators");
      if (!res.ok) {
        throw new Error("Failed to fetch collaborators");
      }
      return (await res.json()) as GetCollaboratorsResult[];
    },
    enabled: Boolean(currentUserId),
  });

  return (
    <Stack w={320} gap="md" pos="sticky" top={80}>
      <SectionCard
        title="Recommended Collaborators"
        icon={<IconUsers size={18} />}
        actionLabel="See all"
      >
        <Stack gap={0}>
          {(collaboratorsQuery.data ?? []).slice(0, 3).map((person) => (
            <Group
              key={person.profile_user_id}
              py="sm"
              wrap="nowrap"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
            >
              <Avatar radius="xl" color="blue">
                {initials(`${person.first_name} ${person.last_name}`)}
              </Avatar>
              <Box flex={1} miw={0}>
                <Text size="sm" fw={800} truncate>
                  {person.first_name} {person.last_name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {person.occupation || person.workplace || "Researcher"}
                </Text>
                <Badge size="xs" color="green" variant="light" mt={4}>
                  {Math.round(person.cosine_similarity * 100)}% match
                </Badge>
              </Box>
              <PostFollowButton
                currentUserId={currentUserId ?? null}
                targetUserId={person.profile_user_id}
              />
            </Group>
          ))}
          {collaboratorsQuery.isLoading ? (
            <Text size="sm" c="dimmed">
              Loading collaborators...
            </Text>
          ) : null}
        </Stack>
      </SectionCard>

      <SectionCard
        title="Trending Research"
        icon={<IconTrendingUp size={18} />}
        accent="teal"
      >
        <Stack gap={4}>
          {(trendingTags ?? []).slice(0, 5).map((tag) => (
            <Button
              key={String(tag)}
              variant="subtle"
              color="gray"
              justify="space-between"
              px="xs"
              rightSection={<IconChevronRight size={14} />}
              disabled
            >
              <Group gap="sm">
                <Text size="sm" fw={800} c="gray.4">
                  {Math.max(1, (trendingTags ?? []).indexOf(tag) + 1)}
                </Text>
                <Text size="sm" c="gray.8">
                  #{String(tag).replace(/\s+/g, "")}
                </Text>
              </Group>
            </Button>
          ))}
        </Stack>
      </SectionCard>

      {searchPublicGroupsAction && joinGroupAction && getGroupsAction ? (
        <LSPopularGroupsHomeStrip
          searchPublicGroupsAction={searchPublicGroupsAction}
          joinGroupAction={joinGroupAction}
          getGroupsAction={getGroupsAction}
        />
      ) : null}
    </Stack>
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
        {actionLabel ? (
          <Button
            variant="subtle"
            color="blue"
            size="compact-xs"
            rightSection={<IconChevronRight size={12} />}
            disabled
          >
            {actionLabel}
          </Button>
        ) : null}
      </Group>
      {children}
    </Card>
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
    <Button variant="subtle" color="gray" justify="flex-start" disabled>
      {content}
    </Button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function deriveTitle(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "Untitled research update";
  }

  const firstSentence = trimmed.split(/[.!?]\s/)[0]?.trim() || trimmed;
  return firstSentence.length > 90
    ? `${firstSentence.slice(0, 87).trim()}...`
    : firstSentence;
}

function deriveDescription(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "No description available.";
  }

  if (trimmed.length <= 180) {
    return trimmed;
  }

  return `${trimmed.slice(0, 177).trim()}...`;
}
