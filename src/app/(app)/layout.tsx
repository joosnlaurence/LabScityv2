import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Box, Space } from "@mantine/core";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Box>
      <AppNavbar userId={user.id} />
      <Space h={60} /> {/* as big as the navbar; this adds spacing to that so it doesnt look weird */}
      <Box>
        {children}
      </Box>
      {/* add some empty space at footer to make space for navbar on mobile */}
      <Space h={60} />
    </Box>
  );
}
