import { Box } from "@mantine/core";
import { redirect } from "next/navigation";
import NotificationProvider from "@/components/notifications/LSNotificationProvider";
import { createClient } from "@/supabase/server";
import LSAppLayout from "./app-layout";

// this code is running SERVERSIDE!!!

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. server checks auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. if no auth, go to login
  if (!user) {
    redirect("/login");
  }

  // 3. check if the user is a moderator
  const { data: moderatorRow } = await supabase
    .from("moderators")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isModerator = !!moderatorRow;

  // 4. if auth OK, render layout; pass userid to clientside components so they can request the data they need based on it (e.g. profiles)
  return (
    <Box style={{ minHeight: "100vh" }}>
      <NotificationProvider>
        {/* lots of interactivity with app layout so we offload this to clientside */}
        <LSAppLayout userId={user.id} isModerator={isModerator} children={children} />
      </NotificationProvider>
    </Box>
  );
}
