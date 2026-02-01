import { Group, Badge, Button, Text, Image, Card, Box, Avatar } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

interface ProfileWidgetProps {
  profileName: string,
  profileInstitution: string,
  profileRole: string,
  profileResearchInterest: string,
  profileAbout?: string,
  profileSkills?: string[],
  profileHeaderImageURL?: string,
  profilePicURL?: string
}

export default function ProfileWidget({ profileName, profileInstitution, profileRole, profileResearchInterest, profileAbout, profileSkills, profileHeaderImageURL, profilePicURL }: ProfileWidgetProps) {
  return (
    <Card bg="gray.2" shadow="sm" padding="none" radius="md" m={4} withBorder>
      <Image
        bg="gray"
        w="100%"
        h={100}
        mb={-64}
        src={profileHeaderImageURL}
      />
      <Box p="lg">
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
          }}
          mb={12}
        >
          <Avatar
            src={profilePicURL}
            radius="xl"
            size="xl"
          />
          <Box>
            <Text c="navy.8" size="32px" fw={700} mb={4}>
              {profileName}
            </Text>

            <Box>
              <Text span c="navy.7" size="18px" fw={600} mb={2}>{profileRole}, {profileInstitution}</Text>
            </Box>

            <Text c="navy.7" size="16px" mb={1.5}>{profileResearchInterest}</Text>

          </Box>
        </Box>
        <Box mb={12}>
          {profileAbout &&
            <Box mb={12}>
              <Text c="navy.8" fw={600}>About</Text>
              <Text c="navy.7">{profileAbout}</Text>
            </Box>
          }
          {(profileSkills && profileSkills.length > 0) &&
            <Box mb={12}>
              <Text c="navy.8" fw={600} mb={8}>
                Skills
              </Text>
              <Group gap={8}>
                {(profileSkills.map((skill, i) => {
                  return (
                    <Badge key={i} color="navy.7" variant="light">
                      {skill}
                    </Badge>
                  )
                }))}
              </Group>
            </Box>
          }
          <Box
            mt={24}
            mb={12}
            w="100%"
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button radius="xl" variant="filled" color="navy.6"><IconPencil size={18} /></Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};
