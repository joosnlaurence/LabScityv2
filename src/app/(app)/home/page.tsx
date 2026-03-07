import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/home-feed";
import {
  createComment,
  createPost,
  createPostImageUploadUrl,
  createReport,
  likeComment,
  likePost,
} from "@/lib/actions/feed";
import { Flex } from "@mantine/core";
import { Suspense } from "react";
import { TrendingWidget } from "@/components/sidebar/trending-widget";
import { TrendingWidgetSkeleton } from "@/components/sidebar/trending-widget-skeleton";

export const metadata: Metadata = {
  title: "Home | LabScity",
  description: "Discover research updates from the LabScity community.",
};

export default async function HomePage() {
  return (
    <>
        
        <Flex flex={6}>
          <HomeFeed
            createPostAction={createPost}
            createPostImageUploadUrlAction={createPostImageUploadUrl}
            createCommentAction={createComment}
            createReportAction={createReport}
            likePostAction={likePost}
            likeCommentAction={likeComment}
          />
        </Flex>
        
        {/* trending + sidecards */}
        <Flex flex={4} miw={{ base: "100%", sm: 'auto'}}>
          <Suspense fallback={<TrendingWidgetSkeleton />}>
            <TrendingWidget />
          </Suspense>
        </Flex>

    </>
  );
}
