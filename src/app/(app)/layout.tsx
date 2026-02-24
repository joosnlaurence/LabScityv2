import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { AppNavbar } from "@/components/layout/app-navbar";
import NotificationProvider from "@/components/notifications/LSNotificationProvider";
import { Box, Space } from "@mantine/core";

// this code is running SERVERSIDE!!!

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. server checks auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. if no auth, go to login 
  if (!user) {
    redirect("/login");
  }

  // 3. if auth OK, render layout; pass userid to clientside components so they can request the data they need based on it (e.g. profiles) 
  return (
    <Box style={{ minHeight: "100vh" }}>
      <NotificationProvider>

        <AppNavbar userId={user.id} />
        <Space h={60} visibleFrom="sm" /> {/* as big as the navbar; top spacing if desktop, bottom if mobile */}
        <Box>
          {children}
        </Box>
        {/* add some empty space at footer to make space for navbar on mobile */}
        <Space h={60} hiddenFrom="sm" />
      </NotificationProvider>
    </Box>
  );
}
