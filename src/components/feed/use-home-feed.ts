"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { getFeed } from "@/lib/actions/post";
import type { FeedPostItem } from "@/lib/types/feed";
import { feedKeys } from "@/lib/query-keys";
import {
	feedFilterSchema,
	type CreateCommentValues,
	type CreatePostValues,
	type CreateReportValues,
} from "@/lib/validations/post";
import type { HomeFeedProps } from "./home-feed.types";

const defaultFeedFilter = feedFilterSchema.parse({});

export function useHomeFeed({
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

	return {
		posts,
		isFeedLoading,
		isFeedError,
		feedError,
		reportTarget,
		setReportTarget,
		activeCommentPostId,
		setActiveCommentPostId,
		isComposerOpen,
		setIsComposerOpen,
		createPostMutation,
		createCommentMutation,
		handleSubmitPost,
		onSubmitReport,
		handleAddComment,
		handleTogglePostLike,
		handleToggleCommentLike,
	};
}
