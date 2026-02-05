import { Text, Box, Avatar } from "@mantine/core";

export interface OtherProfileProps {
  key: number,
  posterName: string,
  posterResearchInterest: string,
  posterProfilePicURL?: string,
}

export default function OtherProfile({ posterName, posterResearchInterest, posterProfilePicURL }: OtherProfileProps) {
  return (
    <Box style={{ display: "flex", alignItems: "center", gap: 12 }} mb={12}>
      <Avatar src={posterProfilePicURL} radius="xl" />
      <Box>
        <Text c="navy.7" size="md" fw={600}>
          {posterName}
        </Text>
        <Text c="navy.7" size="sm" mt={-4}>
          {posterResearchInterest}
        </Text>
      </Box>
    </Box>
  );
};
