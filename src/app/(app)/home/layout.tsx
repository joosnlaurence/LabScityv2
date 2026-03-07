import { Box, Flex } from "@mantine/core";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Box mih="100vh" bg="gray.0">
      <Box maw={1080} mx="auto" p="md">
        <Flex direction={{base: "column-reverse", sm: "row"}} gap="lg" align="flex-start">
          {children}
        </Flex>
      </Box>
    </Box >
  );
}
