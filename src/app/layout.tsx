import "@mantine/core/styles.css"; 
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "@/lib/constants/theme";
import { QueryProvider } from "@/components/providers/query-provider"; 

export const metadata = {
  title: "LabScity",
  description: "Social Media for Scientists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <QueryProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}