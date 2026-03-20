import type {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  deletePost,
  likeComment,
  likePost,
} from "@/lib/actions/feed";
import type {
  getGroups,
  joinGroup,
  searchPublicGroups,
} from "@/lib/actions/groups";

export type CreatePostAction = typeof createPost;
export type CreatePostImageUploadUrlAction = typeof createPostImageUploadUrl;
export type CreateCommentAction = typeof createComment;
export type CreateReportAction = typeof createReport;
export type LikePostAction = typeof likePost;
export type LikeCommentAction = typeof likeComment;
export type DeletePostAction = typeof deletePost;

export interface HomeFeedProps {
  createPostAction: CreatePostAction;
  createPostImageUploadUrlAction: CreatePostImageUploadUrlAction;
  createCommentAction: CreateCommentAction;
  createReportAction: CreateReportAction;
  likePostAction: LikePostAction;
  likeCommentAction: LikeCommentAction;
  deletePostAction: DeletePostAction;
  currentUserId: string | null;
  /** When set (signed-in home), shows a “Popular groups” strip above the feed. */
  popularGroupsActions?: {
    searchPublicGroupsAction: typeof searchPublicGroups;
    joinGroupAction: typeof joinGroup;
    getGroupsAction: typeof getGroups;
  };
}
