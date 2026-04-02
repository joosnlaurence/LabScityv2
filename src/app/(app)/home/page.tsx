import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/home-feed";
import {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  likeComment,
  likePost,
  deletePost,
} from "@/lib/actions/feed";
import { Flex } from "@mantine/core";
import { Suspense } from "react";
import { TrendingWidget } from "@/components/sidebar/trending-widget";
import { TrendingWidgetSkeleton } from "@/components/sidebar/trending-widget-skeleton";
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
      currentUserId={user?.id ?? null}
      deletePostAction={deletePost}
    />
  );
}
