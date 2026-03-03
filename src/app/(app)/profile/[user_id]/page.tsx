import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { LSProfileView } from "@/components/profile/ls-profile-view";

// Server component for /profile/[user_id].
// Uses the dynamic route param to decide which profile to show,
// then hydrates TanStack Query cache for the client LSProfileView.
interface ProfilePageProps {
  // In React 19 / latest Next, params is passed as a Promise
  // and must be awaited before accessing its properties.
  params: Promise<{
    user_id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user_id } = await params;
  const userId = user_id;

  const queryClient = new QueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <LSProfileView userId={userId} isOwnProfile={false} />
    </HydrationBoundary>
  );
}
