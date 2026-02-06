import {
	createComment,
	createPost,
	createReport,
	likeComment,
	likePost,
} from "@/lib/actions/feed";

export type CreatePostAction = typeof createPost;
export type CreateCommentAction = typeof createComment;
export type CreateReportAction = typeof createReport;
export type LikePostAction = typeof likePost;
export type LikeCommentAction = typeof likeComment;

export interface HomeFeedProps {
	createPostAction: CreatePostAction;
	createCommentAction: CreateCommentAction;
	createReportAction: CreateReportAction;
	likePostAction: LikePostAction;
	likeCommentAction: LikeCommentAction;
}
