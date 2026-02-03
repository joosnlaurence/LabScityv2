"use client";

import { useState } from "react";
import { Button, FileInput, Group, Paper, Stack, TextInput, Textarea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostCard } from "@/components/feed/post-card";
import { PostCommentCard } from "@/components/feed/post-comment-card";
import { ReportOverlay } from "@/components/report/report-overlay";
import type { FeedCommentItem, FeedPostItem } from "@/lib/types/feed";
import {
	createCommentSchema,
	createPostSchema,
	type CreateCommentValues,
	type CreatePostValues,
	type CreateReportValues,
} from "@/lib/validations/post";
import classes from "./home-feed.module.css";

interface HomeFeedProps {
	initialPosts?: FeedPostItem[];
}

export function HomeFeed({ initialPosts = [] }: HomeFeedProps) {
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [posts, setPosts] = useState<FeedPostItem[]>(initialPosts);
	const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
	const [reportTarget, setReportTarget] = useState<
		| { type: "post"; postId: string }
		| { type: "comment"; postId: string; commentId: string }
		| null
	>(null);

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreatePostValues>({
		resolver: zodResolver(createPostSchema),
		mode: "onChange",
		defaultValues: {
			userName: "",
			scientificField: "",
			content: "",
			category: "general",
			mediaFile: undefined,
			mediaUrl: "",
			link: "",
		},
	});

	const onSubmit = handleSubmit((values) => {
		const mediaFile = values.mediaFile as File | undefined;
		const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null;

		const newPost: FeedPostItem = {
			id: crypto.randomUUID(),
			userName: values.userName.trim(),
			scientificField: values.scientificField.trim(),
			content: values.content.trim(),
			timeAgo: "Just now",
			mediaUrl,
			comments: [],
			isLiked: false,
			audienceLabel: null,
		};

		setPosts((current) => [newPost, ...current]);
		reset({
			userName: "",
			scientificField: "",
			content: "",
			category: "general",
			mediaFile: undefined,
			mediaUrl: "",
			link: "",
		});
		setIsComposerOpen(false);
	});

	const onSubmitReport = (values: CreateReportValues) => {
		if (!reportTarget) return;
		// TODO: Submit report to database, including report type and description.
		setReportTarget(null);
	};

	const handleAddComment = (postId: string, values: CreateCommentValues) => {
		const newComment: FeedCommentItem = {
			id: crypto.randomUUID(),
			userName: values.userName.trim(),
			content: values.content.trim(),
			timeAgo: "Just now",
			isLiked: false,
		};

		setPosts((current) =>
			current.map((post) =>
				post.id === postId ? { ...post, comments: [newComment, ...post.comments] } : post,
			),
		);
		setActiveCommentPostId(null);
	};

	const handleTogglePostLike = (postId: string) => {
		setPosts((current) =>
			current.map((post) =>
				post.id === postId ? { ...post, isLiked: !post.isLiked } : post,
			),
		);
	};

	const handleToggleCommentLike = (postId: string, commentId: string) => {
		setPosts((current) =>
			current.map((post) =>
				post.id === postId
					? {
							...post,
							comments: post.comments.map((comment) =>
								comment.id === commentId
									? { ...comment, isLiked: !comment.isLiked }
									: comment,
							),
						}
					: post,
			),
		);
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
				<Paper className={classes.newPostCard}>
					<form onSubmit={onSubmit}>
						<Stack gap="sm">
							<TextInput
								label="Name"
								placeholder="Need to remove this"
								error={errors.userName?.message}
								{...register("userName")}
							/>
							<TextInput
								label="Scientific Field"
								placeholder="Need to change to a dropdown"
								error={errors.scientificField?.message}
								{...register("scientificField")}
							/>
							<Textarea
								label="Post"
								placeholder="Share an update with the community..."
								minRows={3}
								error={errors.content?.message}
								{...register("content")}
							/>
							<Controller
								control={control}
								name="mediaFile"
								render={({ field }) => (
									<FileInput
										label="Picture (optional)"
										placeholder="Upload an image"
										accept="image/*"
										value={field.value ? (field.value as File) : null}
										onChange={field.onChange}
										error={errors.mediaFile?.message as string | undefined}
									/>
								)}
							/>
							<Group className={classes.formActions}>
								<Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
									Post
								</Button>
							</Group>
						</Stack>
					</form>
				</Paper>
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

interface CommentComposerProps {
	postId: string;
	onAddComment: (postId: string, values: CreateCommentValues) => void;
}

function CommentComposer({ postId, onAddComment }: CommentComposerProps) {
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreateCommentValues>({
		resolver: zodResolver(createCommentSchema),
		mode: "onChange",
		defaultValues: {
			userName: "",
			content: "",
		},
	});

	const onCommentSubmit = handleSubmit((values) => {
		onAddComment(postId, values);
		reset({
			userName: "",
			content: "",
		});
	});

	return (
		<Paper className={classes.commentComposer}>
			<form onSubmit={onCommentSubmit}>
				<Stack gap="sm">
					<TextInput
						label="Name"
						placeholder="Dr. Ada Lovelace"
						error={errors.userName?.message}
						{...register("userName")}
					/>
					<Textarea
						label="Comment"
						placeholder="Share a thought..."
						minRows={2}
						error={errors.content?.message}
						{...register("content")}
					/>
					<Group className={classes.formActions}>
						<Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
							Comment
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
