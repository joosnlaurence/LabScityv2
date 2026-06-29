import type {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  deletePost,
  likeComment,
  likePost,
  updatePost,
} from "@/lib/actions/feed";
import type {
  getGroups,
  joinGroup,
  searchPublicGroups,
} from "@/lib/actions/groups";
import type { User } from "@/lib/types/feed";

export type CreatePostAction = typeof createPost;
export type CreatePostImageUploadUrlAction = typeof createPostImageUploadUrl;
export type CreateCommentAction = typeof createComment;
export type CreateReportAction = typeof createReport;
export type LikePostAction = typeof likePost;
export type LikeCommentAction = typeof likeComment;
export type DeletePostAction = typeof deletePost;
export type UpdatePostAction = typeof updatePost;
export type SearchPublicGroupsAction = typeof searchPublicGroups;
export type JoinGroupAction = typeof joinGroup;
export type GetGroupsAction = typeof getGroups;

export interface HomeFeedProps {
  createPostAction: CreatePostAction;
  createPostImageUploadUrlAction: CreatePostImageUploadUrlAction;
  createCommentAction: CreateCommentAction;
  createReportAction: CreateReportAction;
  likePostAction: LikePostAction;
  likeCommentAction: LikeCommentAction;
  deletePostAction: DeletePostAction;
  updatePostAction: UpdatePostAction;
  currentUserId: string | null;
  currentUser?: User | null;
  trendingTags?: string[];
  searchPublicGroupsAction?: SearchPublicGroupsAction;
  joinGroupAction?: JoinGroupAction;
  getGroupsAction?: GetGroupsAction;
}
