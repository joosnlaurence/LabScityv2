import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/home-feed";
import {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  deletePost,
  likeComment,
  likePost,
  updatePost,
} from "@/lib/actions/feed";
import { createClient } from "@/supabase/server";

export const metadata: Metadata = {
  title: "Home | LabScity",
  description: "Discover research updates from the LabScity community.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    />
  );
}
