"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { CommentComposer } from "@/components/feed/comment-composer";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCommentCard } from "@/components/feed/post-comment-card";
import { ReportOverlay } from "@/components/report/report-overlay";
import {
	createComment,
	createPost,
	createReport,
	getFeed,
	likeComment,
	likePost,
} from "@/lib/actions/post";
import type { FeedPostItem } from "@/lib/types/feed";

type CreatePostAction = typeof createPost;
type CreateCommentAction = typeof createComment;
type CreateReportAction = typeof createReport;
type LikePostAction = typeof likePost;
type LikeCommentAction = typeof likeComment;

interface HomeFeedProps {
	createPostAction: CreatePostAction;
	createCommentAction: CreateCommentAction;
	createReportAction: CreateReportAction;
	likePostAction: LikePostAction;
	likeCommentAction: LikeCommentAction;
}
import { feedKeys } from "@/lib/query-keys";
import {
	feedFilterSchema,
	type CreateCommentValues,
	type CreatePostValues,
	type CreateReportValues,
} from "@/lib/validations/post";
import classes from "./home-feed.module.css";

const defaultFeedFilter = feedFilterSchema.parse({});

export function HomeFeed({
	createPostAction,
	createCommentAction,
	createReportAction,
	likePostAction,
	likeCommentAction,
}: HomeFeedProps) {
	const queryClient = useQueryClient();
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
	const [reportTarget, setReportTarget] = useState<
		| { type: "post"; postId: string }
		| { type: "comment"; postId: string; commentId: string }
		| null
	>(null);

	const {
		data: feedData,
		isLoading: isFeedLoading,
		isError: isFeedError,
		error: feedError,
	} = useQuery({
		queryKey: feedKeys.list(defaultFeedFilter),
		queryFn: async () => {
			const result = await getFeed(defaultFeedFilter);
			if (!result.success || !result.data) {
				throw new Error(result.error ?? "Failed to fetch feed");
			}
			return result.data;
		},
	});

	const createPostMutation = useMutation({
		mutationFn: async (values: CreatePostValues) => {
			const payload = {
				userName: values.userName,
				scientificField: values.scientificField,
				content: values.content,
				category: values.category,
				mediaUrl: values.mediaUrl ?? "",
				link: values.link ?? "",
			};
			const result = await createPostAction(payload);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to create post");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: feedKeys.all });
			setIsComposerOpen(false);
		},
		onError: (error) => {
			notifications.show({
				title: "Could not create post",
				message: error instanceof Error ? error.message : "Something went wrong",
				color: "red",
			});
		},
	});

	const createCommentMutation = useMutation({
		mutationFn: async ({
			postId,
			values,
		}: {
			postId: string;
			values: CreateCommentValues;
		}) => {
			const result = await createCommentAction(postId, values);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to create comment");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: feedKeys.all });
			setActiveCommentPostId(null);
		},
		onError: (error) => {
			notifications.show({
				title: "Could not add comment",
				message: error instanceof Error ? error.message : "Something went wrong",
				color: "red",
			});
		},
	});

	const createReportMutation = useMutation({
		mutationFn: async ({
			postId,
			commentId,
			values,
		}: {
			postId: string;
			commentId: string | null;
			values: CreateReportValues;
		}) => {
			const result = await createReportAction(postId, commentId, values);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to submit report");
			}
			return result;
		},
		onSuccess: () => {
			setReportTarget(null);
			notifications.show({
				title: "Report submitted",
				message: "Thank you. We will review this report.",
				color: "green",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not submit report",
				message: error instanceof Error ? error.message : "Something went wrong",
				color: "red",
			});
		},
	});

	const likePostMutation = useMutation({
		mutationFn: async (postId: string) => {
			const result = await likePostAction(postId);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to update like");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: feedKeys.all });
		},
		onError: (error) => {
			notifications.show({
				title: "Could not update like",
				message: error instanceof Error ? error.message : "Something went wrong",
				color: "red",
			});
		},
	});

	const likeCommentMutation = useMutation({
		mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
			const result = await likeCommentAction(postId, commentId);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to update like");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: feedKeys.all });
		},
		onError: (error) => {
			notifications.show({
				title: "Could not update like",
				message: error instanceof Error ? error.message : "Something went wrong",
				color: "red",
			});
		},
	});

	const posts: FeedPostItem[] = feedData?.posts ?? [];

	const handleSubmitPost = (values: CreatePostValues) => {
		createPostMutation.mutate(values);
	};

	const onSubmitReport = async (values: CreateReportValues) => {
		if (!reportTarget) return;
		await createReportMutation.mutateAsync({
			postId: reportTarget.type === "post" ? reportTarget.postId : reportTarget.postId,
			commentId: reportTarget.type === "comment" ? reportTarget.commentId : null,
			values,
		});
	};

	const handleAddComment = async (postId: string, values: CreateCommentValues) => {
		await createCommentMutation.mutateAsync({ postId, values });
	};

	const handleTogglePostLike = (postId: string) => {
		likePostMutation.mutate(postId);
	};

	const handleToggleCommentLike = (postId: string, commentId: string) => {
		likeCommentMutation.mutate({ postId, commentId });
	};

	return (
		<Stack gap="lg">
			<ReportOverlay
				open={reportTarget !== null}
				title={reportTarget?.type === "post" ? "Report post" : "Report comment"}
				preview={
					reportTarget?.type === "post"
						? posts
								.filter((post) => post.id === reportTarget.postId)
								.map((post) => (
									<PostCard
										key={post.id}
										userName={post.userName}
										field={post.scientificField}
										timeAgo={post.timeAgo}
										content={post.content}
										mediaUrl={post.mediaUrl ?? null}
										mediaLabel={post.mediaLabel ?? null}
										isLiked={post.isLiked ?? false}
										showMenu={false}
										showActions={false}
									/>
								))
						: posts
								.filter((post) => post.id === reportTarget?.postId)
								.flatMap((post) => post.comments)
								.filter((comment) => comment.id === reportTarget?.commentId)
								.map((comment) => (
									<PostCommentCard
										key={comment.id}
										comment={comment}
										showMenu={false}
										showActions={false}
									/>
								))
				}
				onClose={() => setReportTarget(null)}
				onSubmit={onSubmitReport}
			/>
			<Button
				className={classes.newPostButton}
				leftSection={<IconPlus size={14} />}
				radius="xl"
				variant="default"
				size="sm"
				color="navy"
				onClick={() => setIsComposerOpen((open) => !open)}
			>
				New Post
			</Button>

			{isComposerOpen ? (
				<PostComposer
					key="open"
					onSubmit={handleSubmitPost}
					isPending={createPostMutation.isPending}
				/>
			) : null}

			{isFeedLoading ? (
				<Text size="sm" c="dimmed">
					Loading feed...
				</Text>
			) : isFeedError ? (
				<Text size="sm" c="red">
					{feedError instanceof Error ? feedError.message : "Failed to load feed"}
				</Text>
			) : null}

			<Stack gap="lg" w="100%">
				{posts.map((post) => (
					<Stack key={post.id} className={classes.postStack} w="100%">
						<PostCard
							userName={post.userName}
							field={post.scientificField}
							timeAgo={post.timeAgo}
							content={post.content}
							mediaUrl={post.mediaUrl ?? null}
							mediaLabel={post.mediaLabel ?? null}
							onCommentClick={() =>
								setActiveCommentPostId((current) => (current === post.id ? null : post.id))
							}
							onLikeClick={() => handleTogglePostLike(post.id)}
							isLiked={post.isLiked ?? false}
							onReportClick={() => setReportTarget({ type: "post", postId: post.id })}
							audienceLabel={post.audienceLabel ?? null}
							menuId={`post-menu-${post.id}`}
						/>

						{activeCommentPostId === post.id || post.comments.length > 0 ? (
							<Stack className={classes.commentSection} w="100%" align="stretch">
								{activeCommentPostId === post.id ? (
									<div className={classes.commentItem}>
										<div className={classes.commentCard}>
											<CommentComposer
												postId={post.id}
												onAddComment={handleAddComment}
												isSubmitting={createCommentMutation.isPending}
											/>
										</div>
									</div>
								) : null}
								{post.comments.map((comment) => (
									<div key={comment.id} className={classes.commentItem}>
										<div className={classes.commentCard}>
										<PostCommentCard
											comment={comment}
											onLikeClick={(commentId) =>
												handleToggleCommentLike(post.id, commentId)
											}
											onReportClick={(commentId) =>
												setReportTarget({
													type: "comment",
													postId: post.id,
													commentId,
												})
											}
											menuId={`comment-menu-${comment.id}`}
										/>
										</div>
									</div>
								))}
							</Stack>
						) : null}
					</Stack>
				))}
			</Stack>
		</Stack>
	);
}
