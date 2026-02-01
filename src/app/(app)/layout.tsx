import { AppNavbar } from "@/components/layout/app-navbar";
import { Box } from "@mantine/core";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box style={{ minHeight: "100vh" }}>
      <AppNavbar />
      <Box>
        {children}
      </Box>
    </Box>
  );
}
