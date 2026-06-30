"use client";

import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Menu,
  Modal,
  Pill,
  PillsInput,
  Select,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Image,
  Spoiler,
  Anchor
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import {
  IconAlertCircle,
  IconBookmark,
  IconBriefcase,
  IconChevronRight,
  IconDots,
  IconFileText,
  IconFolderPlus,
  IconHeart,
  IconPhoto,
  IconMessageCircle,
  IconPin,
  IconPinFilled,
  IconPlus,
  IconQuote,
  IconShare3,
  IconStarFilled,
  IconTrash,
  IconTrendingUp,
  IconUsers,
  IconHeartFilled,
} from "@tabler/icons-react";
import StickyBox from "react-sticky-box";
import { useQuery } from "@tanstack/react-query";
import Cropper from "react-easy-crop";
import { useEditor } from "@tiptap/react";
import NextImage from "next/image";
import Link from "next/link";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/app/use-is-mobile";
import {
  PostRichTextContent,
  createPostEditorExtensions,
} from "@/components/feed/post-rich-text-content";
import { LSPopularGroupsHomeStrip } from "@/components/groups/ls-popular-groups-home-strip";
import type { ApiResponse } from "@/lib/types/api";
import type { GetCollaboratorsResult } from "@/lib/types/collab";
import type { Product, Publication } from "@/lib/types/data";
import { getCroppedImageFile, type CropAreaPixels } from "@/lib/utils/post-image-crop";
import {
  encodeStructuredPostContent,
  normalizePostTags,
  parsePostContent,
  type StructuredPostKind,
} from "@/lib/utils/post-content";
import type { CreatePostValues } from "@/lib/validations/post";
import type { HomeFeedProps } from "./home-feed.types";
import { PostFollowButton } from "./post-follow-button";
import { useHomeFeed } from "./use-home-feed";
import { useGetUser } from "../data/use-data";

const DEFAULT_EDITOR_TEXT_COLOR = "#000000";
const DEFAULT_EDITOR_FONT_SIZE = "16px";
const EDITOR_FONT_SIZE_OPTIONS = [
  { label: "Small", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "Extra Large", value: "22px" },
] as const;
const EDITOR_COLOR_OPTIONS = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1D4ED8" },
  { label: "Teal", value: "#0F766E" },
  { label: "Rose", value: "#BE123C" },
  { label: "Gold", value: "#CA8A04" },
] as const;
const PINNED_POSTS_STORAGE_PREFIX = "labscity:pinned-posts";
const FEED_TAG_FILTER_LIMIT = 5;

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
  const [pinnedPostIds, setPinnedPostIds] = useState<string[]>([]);
  const [activeFeedTags, setActiveFeedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUserId) {
      setPinnedPostIds([]);
      return;
    }

    const stored = window.localStorage.getItem(
      `${PINNED_POSTS_STORAGE_PREFIX}:${currentUserId}`,
    );

    if (!stored) {
      setPinnedPostIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      setPinnedPostIds(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
    } catch {
      setPinnedPostIds([]);
    }
  }, [currentUserId]);

  const togglePinnedPost = (postId: string) => {
    if (!currentUserId) {
      return;
    }

    setPinnedPostIds((current) => {
      const next = current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [postId, ...current];

      window.localStorage.setItem(
        `${PINNED_POSTS_STORAGE_PREFIX}:${currentUserId}`,
        JSON.stringify(next),
      );

      return next;
    });
  };

  const addFeedTag = (tag: string) => {
    const nextTag = tag.trim();

    if (!nextTag) {
      return;
    }

    setActiveFeedTags((current) =>
      normalizePostTags([...current, nextTag]).slice(0, FEED_TAG_FILTER_LIMIT),
    );
  };

  const removeFeedTag = (tag: string) => {
    setActiveFeedTags((current) =>
      current.filter(
        (currentTag) => currentTag.toLowerCase() !== tag.toLowerCase(),
      ),
    );
  };

  const displayPosts = posts
    .map((post, index) => {
      const parsed = parsePostContent(post.content);
      const isPinned = pinnedPostIds.includes(post.id);
      const postTags =
        parsed.tags.length > 0
          ? parsed.tags
          : derivePostTags({
              scientificField: post.scientificField,
              content: parsed.bodyText,
              mediaUrl: post.mediaUrl,
            });

      return {
        index,
        isPinned,
        post,
        postTags,
        priority: isPinned ? 0 : parsed.isFeatured ? 1 : 2,
      };
    })
    .filter(({ postTags }) => {
      if (activeFeedTags.length === 0) {
        return true;
      }

      const normalizedPostTags = postTags.map((tag) => tag.toLowerCase());

      return activeFeedTags.every((tag) =>
        normalizedPostTags.includes(tag.toLowerCase()),
      );
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.index - right.index;
    });

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
            currentUserId={props.currentUserId}
            currentUserName={
              [props.currentUser?.first_name, props.currentUser?.last_name]
                .filter(Boolean)
                .join(" ") || "Your profile"
            }
            activeFeedTags={activeFeedTags}
            isComposerOpen={isComposerOpen}
            onAddFeedTag={addFeedTag}
            onRemoveFeedTag={removeFeedTag}
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

          {displayPosts.map(({ post, isPinned }) => (
            <FeedPostCard
              key={post.id}
              currentUserId={currentUserId}
              isPinned={isPinned}
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
              onTogglePinned={() => togglePinnedPost(post.id)}
            />
          ))}

          {hasNextPage ? (
            <Button
              variant="default"
              radius="md"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
            >
              Load more posts
            </Button>
          ) : null}
        </Stack>

        {!isMobile ? (
          <StickyBox offsetTop={60 + 26} offsetBottom={16}>
            <HomeRightRail
              {...props}
              activeFeedTags={activeFeedTags}
              onTrendClick={addFeedTag}
            />
          </StickyBox>
        ) : null}
      </Flex>
    </Box>
  );
}

function CreatePostCard({
  currentUserId,
  currentUserName,
  activeFeedTags,
  isComposerOpen,
  onAddFeedTag,
  onRemoveFeedTag,
  onToggleComposer,
  onSubmit,
  isPending,
}: {
  currentUserId: string | null;
  currentUserName: string;
  activeFeedTags: string[];
  isComposerOpen: boolean;
  onAddFeedTag: (tag: string) => void;
  onRemoveFeedTag: (tag: string) => void;
  onToggleComposer: () => void;
  onSubmit: (values: CreatePostValues & { mediaFile?: File | null }) => void;
  isPending: boolean;
}) {
  const [composerMode, setComposerMode] =
    useState<StructuredPostKind>("normal");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [draftBodyHtml, setDraftBodyHtml] = useState("<p></p>");
  const [draftBodyText, setDraftBodyText] = useState("");
  const [isFeaturedPost, setIsFeaturedPost] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState(
    DEFAULT_EDITOR_TEXT_COLOR,
  );
  const [activeFontSize, setActiveFontSize] = useState(
    DEFAULT_EDITOR_FONT_SIZE,
  );
  const [feedTagInput, setFeedTagInput] = useState("");
  const [isFeedTagInputOpen, setIsFeedTagInputOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CropAreaPixels | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedPublicationId, setSelectedPublicationId] = useState<
    string | null
  >(null);

  const productsQuery = useQuery({
    queryKey: ["home", "composer", "products", currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/products/all?userId=${currentUserId}`);
      if(!response.ok) throw new Error("Failed to load products");
      const payload = (await response.json()) as ApiResponse<Product[]>;
      if (!payload.success) throw new Error(payload.error);

      return payload.data ?? [];
    },
    enabled:
      isComposerOpen && composerMode === "product" && Boolean(currentUserId),
  });

  const publicationsQuery = useQuery({
    queryKey: ["home", "composer", "publications", currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/publications/all?userId=${currentUserId}`);
      if(!response.ok) throw new Error("Failed to load products");
      const payload = (await response.json()) as ApiResponse<Publication[]>;
      if (!payload.success) throw new Error(payload.error);

      return payload.data ?? [];
    },
    enabled:
      isComposerOpen &&
      composerMode === "publication" &&
      Boolean(currentUserId),
  });

  const { data: profile } = useGetUser(currentUserId ?? '');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createPostEditorExtensions("Share your update..."),
    content: draftBodyHtml,
    editorProps: {
      attributes: {
        style: `color: ${DEFAULT_EDITOR_TEXT_COLOR}; font-size: ${DEFAULT_EDITOR_FONT_SIZE};`,
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      currentEditor.chain().setColor(DEFAULT_EDITOR_TEXT_COLOR).run();
      currentEditor.chain().setFontSize(DEFAULT_EDITOR_FONT_SIZE).run();
      syncEditorControls(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      setDraftBodyHtml(currentEditor.getHTML());
      setDraftBodyText(
        currentEditor.getText({ blockSeparator: "\n\n" }).trim(),
      );
      syncEditorControls(currentEditor);
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      syncEditorControls(currentEditor);
    },
  });

  const selectedProduct =
    (productsQuery.data ?? []).find(
      (product) => String(product.product_id) === selectedProductId,
    ) ?? null;

  const selectedPublication =
    (publicationsQuery.data ?? []).find(
      (publication) =>
        String(publication.publication_id) === selectedPublicationId,
    ) ?? null;

  const canPublishNormalPost =
    composerMode === "normal" &&
    draftTitle.trim().length > 0 &&
    draftBodyText.trim().length > 0;

  function syncEditorControls(currentEditor: NonNullable<typeof editor>) {
    const textStyle = currentEditor.getAttributes("textStyle") as {
      color?: string | null;
      fontSize?: string | null;
    };

    setActiveTextColor(textStyle.color || DEFAULT_EDITOR_TEXT_COLOR);
    setActiveFontSize(textStyle.fontSize || DEFAULT_EDITOR_FONT_SIZE);
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isComposerOpen) {
      return;
    }

    setComposerMode("normal");
    setDraftTitle("");
    setDraftTags([]);
    setTagInput("");
    setDraftBodyHtml("<p></p>");
    setDraftBodyText("");
    setIsFeaturedPost(false);
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setCropImageUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setActiveTextColor(DEFAULT_EDITOR_TEXT_COLOR);
    setActiveFontSize(DEFAULT_EDITOR_FONT_SIZE);
    setSelectedProductId(null);
    setSelectedPublicationId(null);
    editor
      ?.chain()
      .clearContent()
      .setColor(DEFAULT_EDITOR_TEXT_COLOR)
      .setFontSize(DEFAULT_EDITOR_FONT_SIZE)
      .run();
  }, [editor, isComposerOpen]);

  useEffect(() => {
    if (!editor || composerMode !== "product" || !selectedProduct) {
      return;
    }

    const summary = selectedProduct.short_summary?.trim() ?? "";
    const nextTags = normalizePostTags([
      "Product",
      selectedProduct.product_type ?? "",
    ]);

    setDraftTitle(selectedProduct.title);
    setDraftTags(nextTags);
    setDraftBodyText(summary);
    setDraftBodyHtml(summary ? `<p>${escapeHtml(summary)}</p>` : "<p></p>");
    editor.commands.setContent(summary ? `<p>${escapeHtml(summary)}</p>` : "<p></p>");
    editor.chain().setColor(DEFAULT_EDITOR_TEXT_COLOR).run();
    editor.chain().setFontSize(DEFAULT_EDITOR_FONT_SIZE).run();
    syncEditorControls(editor);
  }, [composerMode, editor, selectedProduct]);

  useEffect(() => {
    if (!editor || composerMode !== "publication" || !selectedPublication) {
      return;
    }

    const summaryParts = [
      selectedPublication.journal,
      selectedPublication.date_published
        ? new Date(selectedPublication.date_published).getFullYear().toString()
        : null,
      selectedPublication.doi ? `DOI: ${selectedPublication.doi}` : null,
    ].filter(Boolean);
    const summary = summaryParts.join(" - ");
    const nextTags = normalizePostTags([
      "Article",
      ...(selectedPublication.is_oa || selectedPublication.pdf_url
        ? ["Full-text available"]
        : []),
      ...(selectedPublication.topics ?? []),
    ]);

    setDraftTitle(selectedPublication.title);
    setDraftTags(nextTags);
    setDraftBodyText(summary);
    setDraftBodyHtml(summary ? `<p>${escapeHtml(summary)}</p>` : "<p></p>");
    editor.commands.setContent(summary ? `<p>${escapeHtml(summary)}</p>` : "<p></p>");
    editor.chain().setColor(DEFAULT_EDITOR_TEXT_COLOR).run();
    editor.chain().setFontSize(DEFAULT_EDITOR_FONT_SIZE).run();
    syncEditorControls(editor);
  }, [composerMode, editor, selectedPublication]);

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }

      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl);
      }
    };
  }, [cropImageUrl, mediaPreviewUrl]);

  const addTag = () => {
    const nextTag = tagInput.trim();

    if (!nextTag) {
      return;
    }

    setDraftTags((current) => normalizePostTags([...current, nextTag]));
    setTagInput("");
  };

  const activeColorOption =
    EDITOR_COLOR_OPTIONS.find(
      (option) => option.value.toLowerCase() === activeTextColor.toLowerCase(),
    ) ?? EDITOR_COLOR_OPTIONS[0];

  const resetComposer = () => {
    setDraftTitle("");
    setDraftTags([]);
    setTagInput("");
    setDraftBodyHtml("<p></p>");
    setDraftBodyText("");
    setIsFeaturedPost(false);
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setCropImageUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setActiveTextColor(DEFAULT_EDITOR_TEXT_COLOR);
    setActiveFontSize(DEFAULT_EDITOR_FONT_SIZE);
    setSelectedProductId(null);
    setSelectedPublicationId(null);
    editor
      ?.chain()
      .clearContent()
      .setColor(DEFAULT_EDITOR_TEXT_COLOR)
      .setFontSize(DEFAULT_EDITOR_FONT_SIZE)
      .run();
  };

  const handlePublish = () => {
    if (!canPublishNormalPost) {
      return;
    }

    onSubmit({
      content: encodeStructuredPostContent({
        kind: "normal",
        title: draftTitle,
        bodyHtml: draftBodyHtml,
        bodyText: draftBodyText,
        tags: draftTags,
        isFeatured: isFeaturedPost,
        linkedEntity: null,
      }),
      scientificField: draftTags[0] ?? "General",
      category: "general",
      mediaFile,
    });
    resetComposer();
  };

  const handleAddFeedTag = () => {
    const nextTag = feedTagInput.trim();

    if (!nextTag) {
      return;
    }

    onAddFeedTag(nextTag);
    setFeedTagInput("");
    setIsFeedTagInputOpen(false);
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageUrl(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    event.currentTarget.value = "";
  };

  const handleCropConfirm = async () => {
    if (!cropImageUrl || !croppedAreaPixels) {
      return;
    }

    const croppedFile = await getCroppedImageFile(
      cropImageUrl,
      croppedAreaPixels,
      `post-image-${Date.now()}.jpg`,
    );

    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(croppedFile);
    setMediaFile(croppedFile);
    setMediaPreviewUrl(nextPreviewUrl);
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  return (
    <>
      <Modal
        opened={cropImageUrl != null}
        onClose={() => {
          if (cropImageUrl) {
            URL.revokeObjectURL(cropImageUrl);
          }
          setCropImageUrl(null);
        }}
        title="Crop image"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Box
            h={360}
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0F172A",
            }}
          >
            {cropImageUrl ? (
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            ) : null}
          </Box>
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              Zoom
            </Text>
            <Slider
              value={zoom}
              onChange={setZoom}
              min={1}
              max={3}
              step={0.1}
            />
          </Stack>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                if (cropImageUrl) {
                  URL.revokeObjectURL(cropImageUrl);
                }
                setCropImageUrl(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCropConfirm()}>Use image</Button>
          </Group>
        </Stack>
      </Modal>

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
            <Avatar radius="xl" color="navy.7" size={36} src={profile?.avatar_url}>
              {initials(currentUserName)}
            </Avatar>
            <Box>
              <Text size="sm" fw={800} c="#374151">
                What are you working on?
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
            {isComposerOpen ? "Cancel" : "New Post"}
          </Button>
        </Group>

        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          pt="sm"
          style={{ borderTop: "1px solid #F3F4F6" }}
        >
          <Group gap="xs" wrap="wrap">
            <Text size="xs" fw={800} c="#94A3B8" tt="uppercase">
              Show
            </Text>
            {activeFeedTags.map((tag) => (
              <Pill key={`feed-filter-${tag}`} withRemoveButton onRemove={() => onRemoveFeedTag(tag)}>
                {tag}
              </Pill>
            ))}
            {isFeedTagInputOpen ? (
              <TextInput
                value={feedTagInput}
                onChange={(event) => setFeedTagInput(event.currentTarget.value)}
                placeholder="Add tag"
                size="xs"
                w={132}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    handleAddFeedTag();
                  }

                  if (
                    event.key === "Backspace" &&
                    event.currentTarget.value.length === 0
                  ) {
                    event.preventDefault();
                  }

                  if (event.key === "Escape") {
                    setIsFeedTagInputOpen(false);
                    setFeedTagInput("");
                  }
                }}
              />
            ) : null}
            <Button
              variant="light"
              radius="xl"
              size="compact-sm"
              onClick={() => setIsFeedTagInputOpen((current) => !current)}
            >
              Add Tags
            </Button>
          </Group>
        </Group>

        {isComposerOpen ? (
          <Stack gap="sm" pt="md">
            <SegmentedControl
              value={composerMode}
              onChange={(value) => setComposerMode(value as StructuredPostKind)}
              data={[
                { label: "Normal Post", value: "normal" },
                { label: "My Product", value: "product" },
                { label: "My Publication", value: "publication" },
              ]}
              radius="xl"
              size="sm"
            />

            {composerMode === "product" ? (
              <Select
                label="Choose one of your products"
                placeholder="Select a product"
                value={selectedProductId}
                onChange={setSelectedProductId}
                data={(productsQuery.data ?? []).map((product) => ({
                  value: String(product.product_id),
                  label: product.title,
                }))}
                rightSection={
                  productsQuery.isLoading ? <Loader size={16} /> : null
                }
              />
            ) : null}

            {composerMode === "publication" ? (
              <Select
                label="Choose one of your publications"
                placeholder="Select a publication"
                value={selectedPublicationId}
                onChange={setSelectedPublicationId}
                data={(publicationsQuery.data ?? []).map((publication) => ({
                  value: String(publication.publication_id),
                  label: publication.title,
                }))}
                rightSection={
                  publicationsQuery.isLoading ? <Loader size={16} /> : null
                }
                searchable
              />
            ) : null}

            <TextInput
              label="Post title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.currentTarget.value)}
              placeholder="Give your post a clear title"
              styles={{
                input: {
                  borderRadius: 14,
                  borderColor: "#E5E7EB",
                  fontSize: 14,
                },
              }}
            />

            <Stack gap={6}>
              <Text size="sm" fw={600} c="#334155">
                Tags
              </Text>
              <PillsInput
                radius="md"
                styles={{
                  input: {
                    borderColor: "#E5E7EB",
                  },
                }}
              >
                <Pill.Group>
                  {draftTags.map((tag) => (
                    <Pill
                      key={tag}
                      withRemoveButton
                      onRemove={() =>
                        setDraftTags((current) =>
                          current.filter((currentTag) => currentTag !== tag),
                        )
                      }
                    >
                      {tag}
                    </Pill>
                  ))}
                  <PillsInput.Field
                    value={tagInput}
                    onChange={(event) => setTagInput(event.currentTarget.value)}
                    placeholder={
                      draftTags.length === 0
                        ? "Add tags and press Enter"
                        : "Add another tag"
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag();
                      }

                      if (
                        event.key === "Backspace" &&
                        event.currentTarget.value.length === 0
                      ) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Pill.Group>
              </PillsInput>
              <Group gap="xs">
                <Button
                  variant="light"
                  radius="xl"
                  size="compact-sm"
                  onClick={addTag}
                  disabled={tagInput.trim().length === 0}
                >
                  Add tag
                </Button>
                <Text size="xs" c="dimmed">
                  Tags are optional for regular posts.
                </Text>
              </Group>
            </Stack>

            <Stack gap={6}>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Text size="sm" fw={600} c="#334155">
                  Body
                </Text>
                <Group gap="xs">
                  <Select
                    aria-label="Font size"
                    data={EDITOR_FONT_SIZE_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
                    value={activeFontSize}
                    onChange={(value) => {
                      if (!value || !editor) {
                        return;
                      }

                      editor.chain().focus().setFontSize(value).run();
                      setActiveFontSize(value);
                    }}
                    size="xs"
                    w={110}
                  />
                  <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                      <Button
                        variant="default"
                        size="xs"
                        w={138}
                        justify="space-between"
                        title={activeColorOption.label.toLowerCase()}
                        leftSection={
                          <Box
                            w={12}
                            h={12}
                            style={{
                              borderRadius: 999,
                              backgroundColor: activeColorOption.value,
                              border: "1px solid #CBD5E1",
                            }}
                          />
                        }
                      >
                        {activeColorOption.label}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {EDITOR_COLOR_OPTIONS.map((option) => (
                        <Menu.Item
                          key={option.value}
                          onClick={() => {
                            setActiveTextColor(option.value);
                            editor?.chain().focus().setColor(option.value).run();
                          }}
                          leftSection={
                            <Box
                              w={12}
                              h={12}
                              style={{
                                borderRadius: 999,
                                backgroundColor: option.value,
                                border: "1px solid #CBD5E1",
                              }}
                            />
                          }
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              <RichTextEditor
                editor={editor}
                styles={{
                  root: {
                    borderColor: "#E5E7EB",
                    borderRadius: 16,
                    overflow: "hidden",
                  },
                  toolbar: {
                    borderColor: "#E5E7EB",
                  },
                  content: {
                    minHeight: 180,
                    borderColor: "#E5E7EB",
                    backgroundColor: "#FFFFFF",
                    color: DEFAULT_EDITOR_TEXT_COLOR,
                    "& .ProseMirror": {
                      color: DEFAULT_EDITOR_TEXT_COLOR,
                      fontSize: DEFAULT_EDITOR_FONT_SIZE,
                    },
                  },
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={handleFileSelected}
              />
              <Group justify="space-between" wrap="wrap">
                <Button
                  variant="light"
                  radius="xl"
                  leftSection={<IconPhoto size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add image
                </Button>
                {mediaPreviewUrl ? (
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      if (mediaPreviewUrl) {
                        URL.revokeObjectURL(mediaPreviewUrl);
                      }
                      setMediaPreviewUrl(null);
                      setMediaFile(null);
                    }}
                  >
                    Remove image
                  </Button>
                ) : null}
              </Group>
              {mediaPreviewUrl ? (
                <Box
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    aspectRatio: "16 / 9",
                    position: "relative",
                  }}
                >
                  <Image
                    component={NextImage}
                    src={mediaPreviewUrl}
                    alt="Selected post image"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ) : null}
            </Stack>

            {composerMode !== "normal" ? (
              <Alert
                radius="lg"
                color="gray"
                variant="light"
                icon={<IconAlertCircle size={16} />}
              >
                Linked product and publication posts are designed here, but
                publishing them is disabled until the app has a dedicated
                endpoint for creating those linked post types.
              </Alert>
            ) : null}

            <Switch
              checked={isFeaturedPost}
              onChange={(event) =>
                setIsFeaturedPost(event.currentTarget.checked)
              }
              color="yellow"
              label="Feature this post for everyone"
              description="Featured posts get the highlighted styling and stay near the top of every user's home feed."
              disabled={composerMode !== "normal"}
            />

            <Group justify="space-between" wrap="wrap">
              <Group gap="xs" wrap="wrap">
                {composerMode === "product" &&
                productsQuery.error instanceof Error ? (
                  <Badge color="red" variant="light" radius="xl">
                    {productsQuery.error.message}
                  </Badge>
                ) : null}
                {composerMode === "publication" &&
                publicationsQuery.error instanceof Error ? (
                  <Badge color="red" variant="light" radius="xl">
                    {publicationsQuery.error.message}
                  </Badge>
                ) : null}
                {draftTags.map((tag) => (
                  <Badge
                    key={`composer-badge-${tag}`}
                    variant="light"
                    radius="xl"
                    color="blue"
                    style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
              <Button
                color="navy"
                radius="md"
                loading={isPending}
                disabled={!canPublishNormalPost}
                onClick={handlePublish}
              >
                Publish Post
              </Button>
            </Group>
          </Stack>
        ) : null}
        </Stack>
      </Card>
    </>
  );
}

export function FeedPostCard({
  post,
  currentUserId,
  isPinned,
  commentOpen,
  onToggleComments,
  onAddComment,
  onLike,
  onDelete,
  onTogglePinned,
  hidePin,
  hideYourPostBadge
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
  isPinned: boolean;
  commentOpen: boolean;
  onToggleComments: () => void;
  onAddComment: (postId: string, values: { content: string }) => Promise<void>;
  onLike: () => void;
  onDelete: () => void;
  onTogglePinned: () => void;
  hidePin?: boolean;
  hideYourPostBadge?: boolean;
}) {
  const isOwnPost = currentUserId != null && currentUserId === post.userId;
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const parsedContent = parsePostContent(post.content);
  const title = parsedContent.title;
  const description = parsedContent.bodyText;
  const inferredTags =
    parsedContent.tags.length > 0
      ? parsedContent.tags
      : derivePostTags({
          scientificField: post.scientificField,
          content: parsedContent.bodyText,
          mediaUrl: post.mediaUrl,
        });
  const isFeatured = parsedContent.isFeatured;
  const hasHighlightedStyling = isPinned || isFeatured;
  const isCitable =
    parsedContent.kind === "publication" || inferredTags.includes("Article");

  const spoilerControlRef = useRef<HTMLButtonElement>(null);

  return (
    <Card
      radius="xl"
      withBorder
      bg="white"
      p="lg"
      style={{
        borderColor: "#E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <Stack gap="md">
        {hasHighlightedStyling ? (
          <Box
            h={8}
            mx={-24}
            mt={-24}
            style={{
              background:
                "linear-gradient(90deg, #1F3A5F 0%, #2A65C7 55%, #67C7C0 100%)",
            }}
          />
        ) : null}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            {isFeatured ? (
              <Badge
                radius="xl"
                variant="light"
                leftSection={<IconStarFilled size={10} color="#A16207" />}
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FCD34D",
                }}
              >
                Featured
              </Badge>
            ) : null}
            {isPinned ? (
              <Badge
                radius="xl"
                variant="light"
                leftSection={<IconPinFilled size={10} color="#A16207" />}
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FCD34D",
                }}
              >
                Pinned
              </Badge>
            ) : null}
            {isOwnPost && !hideYourPostBadge? (
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
            {inferredTags.map((tag) => (
              <Badge
                key={tag}
                radius="xl"
                variant="light"
                color="blue"
                leftSection={
                  tag === "Article" ? <IconFileText size={10} /> : undefined
                }
                style={{
                  background: tag === "Article" ? "#EFF6FF" : "#EEF2FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                }}
              >
                {tag}
              </Badge>
            ))}
          </Group>
          <Group gap={4} wrap="nowrap">
            {
              !hidePin &&
              <ActionIcon
                variant="subtle"
                color={isPinned ? "yellow" : "gray"}
                aria-label={isPinned ? "Unpin post" : "Pin post"}
                onClick={onTogglePinned}
              >
                {isPinned ? <IconPinFilled size={18} /> : <IconPin size={18} />}
              </ActionIcon>
            }
            {isOwnPost ? (
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Post actions"
                  >
                    <IconDots size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={onDelete}
                  >
                    Delete post
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </Group>
        </Group>

        <Stack gap={8}>
          <Box>
            <Anchor
              component={Link}
              href={`/posts/${post.id}`}
              fw={700}
              fz={17}
              c="#111827"
              style={{
                lineHeight: 1.4,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {title}
            </Anchor>
          </Box>
          {parsedContent.bodyHtml ? (
            <Box c="#475569">
              <PostRichTextContent
                html={parsedContent.bodyHtml}
                maxHeight={160}
              />
            </Box>
          ) : (
            <Spoiler
              controlRef={spoilerControlRef}
              fz="sm"
              c="#475569"
              lh={1.6}
              maxHeight={176} // Enough for about 8 lines worth of content
              showLabel='Show more'
              hideLabel='Hide'
              style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
              styles={{
                control: {
                  color: 'var(--mantine-color-blue-7)',
                  fontSize: 'var(--mantine-font-size-sm)',
                  fontWeight: 600
                }
              }}
            >
              {description}
            </Spoiler>
          )}
        </Stack>

        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Avatar 
              size={28} 
              src={post.avatarUrl ?? undefined} 
              color="blue"
              component={Link}
              href={`/profile/${post.userId}`}
            >
              {initials(post.userName)}
            </Avatar>
            {/* <Avatar.Group spacing="sm">
              <Avatar size={28} src={post.avatarUrl ?? undefined} color="blue">
                {initials(post.userName)}
              </Avatar>
              <Avatar size={28} color="cyan">
                {(post.scientificField || "GE").slice(0, 2).toUpperCase()}
              </Avatar>
            </Avatar.Group> */}
            
              <Text
                size="sm"
                style={{
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <Anchor
                  component={Link}
                  href={`/profile/${post.userId}`}
                  underline="hover"
                >
                  <Text 
                    span
                    c="#1F2937"
                    fw={600}
                  >
                    {post.userName}
                  </Text>
                </Anchor>
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

        {inferredTags.length > 0 ? (
          <Group gap={6} wrap="wrap">
            {inferredTags.map((tag) => (
              <Button
                key={`pill-${tag}`}
                variant="light"
                radius="xl"
                size="compact-sm"
                style={{
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  border: "1px solid #BFDBFE",
                }}
              >
                {tag}
              </Button>
            ))}
          </Group>
        ) : null}

        {post.mediaUrl ? (
          <Box
            pos="relative"
            mah={600}
            maw='100%'
            fw={600}
            style={{
              aspectRatio: `${(post.mediaWidth ?? 1) / (post.mediaHeight ?? 1)}`,
              overflow: "hidden",
              letterSpacing: "0.3px",
            }}
          >
            <Image
              component={NextImage}
              src={post.mediaUrl}
              alt="Post attachment"
              bdrs="lg"
              bg='navy.0'
              fill
              mah={600}
              style={{ objectFit: "contain" }}
            />
          </Box>
        ) : null}

        <Divider color="#E5E7EB" />

        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="lg">
            <Button
              variant="subtle"
              color={post.isLiked ? "red" : "gray"}
              leftSection={post.isLiked ? <IconHeartFilled size={16}/> : <IconHeart size={16} />}
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
            {isCitable ? (
              <Button
                variant="outline"
                radius="md"
                color="gray"
                leftSection={<IconQuote size={15} />}
                disabled
              >
                Cite
              </Button>
            ) : null}
          </Group>
        </Group>

        {commentOpen ? (
          <Stack gap="sm">
            <Divider />
            {post.comments.map((item) => (
              <Group key={item.id} align="flex-start" wrap="nowrap">
                <Avatar size="sm" radius="xl" src={item.avatarUrl ?? undefined}>
                  {initials(item.userName)}
                </Avatar>
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" fw={700}>
                    {item.userName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.timeAgo}
                  </Text>
                  <Text
                    size="sm"
                    mt={4}
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
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
          <RailButton icon={<IconPlus size={16} />} label="Add Product" />
        </Stack>
      </Card>
    </Stack>
  );
}

export function RecommendedCollabsCard({ currentUserId }: { currentUserId: string | null }) {
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
            <Avatar component={Link} href={`/profile/${person.profile_user_id}`} radius="xl" color="blue">
              {initials(`${person.first_name} ${person.last_name}`)}
            </Avatar>
            <Box flex={1} miw={0}>
              <Anchor component={Link} href={`/profile/${person.profile_user_id}`}>
                <Text size="sm" fw={800} truncate>
                  {person.first_name} {person.last_name}
                </Text>
              </Anchor>
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
  )
} 

function HomeRightRail({
  currentUserId,
  trendingTags,
  activeFeedTags,
  onTrendClick,
  searchPublicGroupsAction,
  joinGroupAction,
  getGroupsAction,
}: HomeFeedProps & {
  activeFeedTags: string[];
  onTrendClick: (tag: string) => void;
}) {
  return (
    <Stack w={320} gap="md" pos="sticky" top={80}>
      <RecommendedCollabsCard currentUserId={currentUserId} />

      {/* <SectionCard
        title="Trending Research"
        icon={<IconTrendingUp size={18} />}
        accent="teal"
      >
        <Stack gap={4}>
          {(trendingTags ?? []).slice(0, 5).map((tag, i) => (
            <Button
              key={`${tag}${i}}`}
              variant={
                activeFeedTags.some(
                  (activeTag) => activeTag.toLowerCase() === String(tag).toLowerCase(),
                )
                  ? "light"
                  : "subtle"
              }
              color="gray"
              justify="space-between"
              px="xs"
              rightSection={<IconChevronRight size={14} />}
              onClick={() => onTrendClick(String(tag))}
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
      </SectionCard> */}

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

// function deriveDescription(content: string) {
//   const trimmed = content.trim();
//   if (!trimmed) {
//     return "No description available.";
//   }

//   if (trimmed.length <= 180) {
//     return trimmed;
//   }

//   return `${trimmed.slice(0, 177).trim()}...`;
// }

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function derivePostTags(post: {
  scientificField: string;
  content: string;
  mediaUrl?: string | null;
}) {
  const tags: string[] = [];
  const normalizedContent = (post.content ?? '').toLowerCase();
  const normalizedField = (post.scientificField ?? '').trim().toLowerCase();

  const looksLikeArticle =
    normalizedContent.includes("doi.org/") ||
    normalizedContent.includes("doi:") ||
    normalizedContent.includes("published in") ||
    normalizedContent.includes("journal") ||
    normalizedContent.includes("full-text");

  if (looksLikeArticle) {
    tags.push("Article");
  }

  if (post.mediaUrl && normalizedContent.includes("full-text")) {
    tags.push("Full-text available");
  }

  if (
    looksLikeArticle &&
    normalizedField &&
    normalizedField !== "general" &&
    normalizedField !== "other"
  ) {
    tags.push(post.scientificField);
  }

  return tags;
}
