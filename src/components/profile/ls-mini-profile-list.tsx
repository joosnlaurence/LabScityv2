import { Button, Text, Card, Box, Center } from "@mantine/core";
import LSMiniProfile, { OtherProfileProps } from "./ls-mini-profile";
import { IconDots } from "@tabler/icons-react";

export interface LSMiniProfileListProps {
  widgetTitle: string,
  profiles?: OtherProfileProps[]
}

export default function LSMiniProfileList({ widgetTitle, profiles }: LSMiniProfileListProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md">
      <Center mb={8}>
        <Text c="navy.8" fw={600} size="xl">
          {widgetTitle}
        </Text>
      </Center>
      <Box>
        {
          // We must pass profiles and there must be something in the list
          // Otherwise, the list shouldn't be displayed
          profiles && profiles.length > 0 ?
            /*
               FIXME: The key should come from the loop and not manually?
                      consult backend people!
            */
            profiles.map((otherProfile) => {
              return <LSMiniProfile
                key={otherProfile.key}
                posterName={otherProfile.posterName}
                posterResearchInterest={otherProfile.posterResearchInterest}
                posterProfilePicURL={otherProfile.posterProfilePicURL} />
            }) : <Center><Text size="sm" c="navy.6">Nothing to see here!</Text></Center>
        }
      </Box>
      <Center>
        <Button variant="transparent">
          <IconDots style={{ color: "var(--mantine-color-navy-6)" }} />
        </Button>
      </Center>
    </Card>
  );
};
