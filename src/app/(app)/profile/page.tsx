import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

export default async function ProfileIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ action?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.tab) query.set("tab", params.tab);
  if (params?.action) query.set("action", params.action);
  const qs = query.toString();

  redirect(`/profile/${user.id}${qs ? `?${qs}` : ""}`);
}
