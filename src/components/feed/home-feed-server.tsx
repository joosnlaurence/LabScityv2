import { getUser } from "@/lib/actions/data";
import {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  deletePost,
  getTrendingScientificFields,
  likeComment,
  likePost,
  updatePost,
} from "@/lib/actions/feed";
import { getGroups, joinGroup, searchPublicGroups } from "@/lib/actions/groups";
import { createClient } from "@/supabase/server";
import { HomeFeed } from "./home-feed";

export default async function HomeFeedServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [currentUserResult, trendingResult] = await Promise.all([
    user?.id ? getUser(user.id) : Promise.resolve(null),
    getTrendingScientificFields(),
  ]);

  return (
    <HomeFeed
      createPostAction={createPost}
      createPostImageUploadUrlAction={createPostImageUploadUrl}
      createCommentAction={createComment}
      createReportAction={createReport}
      likePostAction={likePost}
      likeCommentAction={likeComment}
      deletePostAction={deletePost}
      updatePostAction={updatePost}
      currentUserId={user?.id ?? null}
      currentUser={currentUserResult?.success ? currentUserResult.data : null}
      trendingTags={
        trendingResult.success ? (trendingResult.data?.hashtags ?? []) : []
      }
      searchPublicGroupsAction={searchPublicGroups}
      joinGroupAction={joinGroup}
      getGroupsAction={getGroups}
    />
  );
}
