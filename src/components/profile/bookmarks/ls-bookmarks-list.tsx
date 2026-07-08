import { FeedPostCard } from "@/components/feed/home-feed";
import { useSetSavedPost } from "@/components/feed/use-feed";
import { BookmarkCategory, SavedItemsData } from "@/lib/types/bookmarks";
import { Stack } from "@mantine/core";
import LSPublication from "../publications/ls-publication";
import LSProduct from "../products/ls-product";
import { JobCard } from "@/components/jobs/jobs-page";

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
      const feedPosts = (data?.posts ?? []).map(post => ({
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

      return (
        <Stack>
        {
          (feedPosts ?? []).map((post) => (
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
      return (
        <Stack>
          {(data?.publications ?? []).map((row) => (
            <LSPublication key={row.publication_id} pub={row.publications} isOwner={false} />
          ))}
        </Stack>
      );
    case "products":
      return (
        <Stack>
          {(data?.products ?? []).map((row) => (
            <LSProduct key={row.product_id} product={row.products} isOwner={false} />
          ))}
        </Stack>
      );
    case "jobs":
      return (
        <Stack>
          {(data?.jobs ?? []).map((row) => (
            <JobCard key={row.jobs_id} job={row.jobs} />
          ))}
        </Stack>
      );
  }
}