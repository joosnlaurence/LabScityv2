import { redirect } from "next/navigation";
import { LandingContent } from "@/components/landing/landing-content";
import { createClient } from "@/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return <LandingContent />;
}
