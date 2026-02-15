import { Text, Box, Avatar } from "@mantine/core";

// TODO: It needs to show the name and email. We don't want usernames, but user needs a way to differentiate profiles.
export interface LSMiniProfileProps {
  // key: number,
  posterName: string,
  posterEmail: string,
  posterResearchInterest: string,
  posterProfilePicURL?: string,
}

export default function LSMiniProfile({ posterName, posterResearchInterest, posterProfilePicURL }: LSMiniProfileProps) {
  return (
    <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
