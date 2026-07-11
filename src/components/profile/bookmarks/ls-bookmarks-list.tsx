import { FeedPostCard } from "@/components/feed/home-feed";
import { useSetSavedPost } from "@/components/feed/use-feed";
import { BookmarkCategory, SavedItemsData } from "@/lib/types/bookmarks";
import { Stack, Text } from "@mantine/core";
import LSPublication from "../publications/ls-publication";
import LSProduct from "../products/ls-product";
import { JobCard } from "@/components/jobs/jobs-page";
import { IconBookmarkOff } from "@tabler/icons-react";
import { useSetSavedPublication } from "../publications/use-publications";
import { useSetSavedProduct } from "../products/use-products";
import { toJobViewModel } from "@/components/jobs/job-view-model";
import { useSetSavedJob } from "@/components/jobs/use-jobs";

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
  const setSavedPost = useSetSavedPost(userId);
  const setSavedPub = useSetSavedPublication(userId);
  const setSavedProduct = useSetSavedProduct(userId);
  const setSavedJob = useSetSavedJob(userId);

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
              onSetSaved={(postId, save) => setSavedPost.mutate({ postId, save: false })}
            />
          ))
        }
        </Stack>
      );
    case "publications":
      const savedPublications = data?.publications ?? [];
      if(savedPublications.length === 0) {
        return <EmptyBookmarksList label='publications'/>;
      }
      
      return (
        <Stack>
          {(data?.publications ?? []).map((row) => (
            <LSPublication 
              key={row.publication_id} 
              pub={{...row.publications, isSaved: row.publications.isSaved ?? true}} 
              isOwner={false} 
              onSaveClick={() => setSavedPub.mutate({ publicationId: row.publication_id, isSaved: false})}
            />
          ))}
        </Stack>
      );
    case "products":
      const savedProducts = data?.products ?? [];
      if(savedProducts.length === 0) {
        return <EmptyBookmarksList label='research products'/>;
      }

      return (
        <Stack>
          {(data?.products ?? []).map((row) => (
            <LSProduct 
              key={row.product_id} 
              product={{...row.products, isSaved: row.products.isSaved ?? true}} 
              isOwner={false} 
              onSaveClick={() => setSavedProduct.mutate({ productId: row.product_id, isSaved: false})}
            />
          ))}
        </Stack>
      );
    case "jobs":
      const savedJobs = data?.jobs ?? [];
      if(savedJobs.length === 0) {
        return <EmptyBookmarksList label='jobs'/>;
      }

      return (
        <Stack>
          {(data?.jobs ?? []).map((row) => (
            <JobCard 
              key={row.job_id} 
              job={toJobViewModel(row.jobs)}
              onSaveClick={() => setSavedJob.mutate({ jobId: row.job_id, isSaved: false })}/>
          ))}
        </Stack>
      );
  }
}