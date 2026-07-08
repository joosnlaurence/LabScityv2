import { FeedPostCard } from "@/components/feed/home-feed";
import { useSetSavedPost } from "@/components/feed/use-feed";
import { BookmarkCategory, SavedItemsData } from "@/lib/types/bookmarks";
import { Stack, Text } from "@mantine/core";
import LSPublication from "../publications/ls-publication";
import LSProduct from "../products/ls-product";
import { JobCard } from "@/components/jobs/jobs-page";
import { IconBookmarkOff } from "@tabler/icons-react";

function EmptyBookmarksList({label}: {label: string}) {
  return (
    <Stack w='100%' align='center' pt='75'>
      <IconBookmarkOff size='64' stroke='1' color='var(--mantine-color-dimmed)'/>
      <Text c='dimmed'>No {label} saved yet</Text>
    </Stack>
  )
}

export default function LSBookmarksList({
  userId,
  category,
  data
}: {
  userId: string,
  category: BookmarkCategory,
  data: SavedItemsData | undefined
}) {
  switch (category) {
    case "posts":
      const savedPosts = (data?.posts ?? []).map(post => ({
        id: String(post.id),
        userId: post.userId,
        userName: post.userName,
        avatarUrl: post.avatarUrl,
        scientificField: post.scientificField ?? "—",
        content: post.content ?? "",
        timeAgo: post.timeAgo,
        mediaUrl: post.mediaUrl ?? null,
        mediaWidth: post.mediaWidth ?? undefined,
        mediaHeight: post.mediaHeight ?? undefined,
        comments: (post.comments ?? []).map((c) => ({
          id: c.id,
          userId: c.userId ?? "",
          userName: c.userName ?? "",
          avatarUrl: c.avatarUrl ?? undefined,
          content: c.content ?? "",
          timeAgo: c.timeAgo,
        })),
        isLiked: post.isLiked ?? false,
        likeCount: post.likeCount ?? 0,
        isSaved: post.isSaved
      }));
      const setSaved = useSetSavedPost(userId);

      if(savedPosts.length === 0) {
        return <EmptyBookmarksList label='posts'/>;
      }

      return (
        <Stack>
        {
          (savedPosts ?? []).map((post) => (
            <FeedPostCard 
              key={post.id} 
              post={post} 
              currentUserId={userId} 
              onLike={()=>{}}
              onDelete={()=>{}}
              onAddComment={async ()=>{}}
              onSetSaved={(postId, save) => setSaved.mutate({ postId, save })}
            />
          ))
        }
        </Stack>
      );
    case "publications":
      const savedPublications = [];
      if(savedPublications.length === 0) {
        return <EmptyBookmarksList label='publications'/>;
      }

      return (
        <Stack>
          {(data?.publications ?? []).map((row) => (
            <LSPublication key={row.publication_id} pub={row.publications} isOwner={false} />
          ))}
        </Stack>
      );
    case "products":
      const savedProducts = [];
      if(savedProducts.length === 0) {
        return <EmptyBookmarksList label='research products'/>;
      }

      return (
        <Stack>
          {(data?.products ?? []).map((row) => (
            <LSProduct key={row.product_id} product={row.products} isOwner={false} />
          ))}
        </Stack>
      );
    case "jobs":
      const savedJobs = [];
      if(savedJobs.length === 0) {
        return <EmptyBookmarksList label='jobs'/>;
      }

      return (
        <Stack>
          {(data?.jobs ?? []).map((row) => (
            <JobCard key={row.jobs_id} job={row.jobs} />
          ))}
        </Stack>
      );
  }
}