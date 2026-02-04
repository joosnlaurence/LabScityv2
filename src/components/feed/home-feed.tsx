"use client";

import { Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { CommentComposer } from "@/components/feed/comment-composer";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCommentCard } from "@/components/feed/post-comment-card";
import { ReportOverlay } from "@/components/report/report-overlay";
import { useHomeFeed } from "@/components/feed/use-home-feed";
import type { HomeFeedProps } from "@/components/feed/home-feed.types";
import classes from "./home-feed.module.css";

export function HomeFeed(props: HomeFeedProps) {
	const {
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
	} = useHomeFeed(props);

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
