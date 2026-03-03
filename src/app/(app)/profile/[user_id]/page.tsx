"use client";

import { useParams } from "next/navigation";
import { LSProfileView } from "@/components/profile/ls-profile-view";

export default function ProfilePage() {
  const params = useParams<{ user_id: string }>();

  return <LSProfileView userId={params.user_id} isOwnProfile={false} />;
}
