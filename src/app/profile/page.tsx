import { Avatar, Badge, Box, Button, Card, Group, Text } from "@mantine/core";

export default function ProfilePage() {
  return (
    <div>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Box style={{ display: "flex", alignItems: "center", gap: 12 }} mb={12}>
          <Avatar radius="xl" />
          <Box>
            <Text size="xl" fw={600}>
              Rafael Niebles
            </Text>

            <Box>
              <Text span>University of Central Florida</Text>
              <Text span ml={6} c="gray">
                Student
              </Text>
            </Box>

            <Text>Computer Science</Text>
          </Box>
        </Box>
        <Box mb={12}>
          <Box mb={12}>
            <Text fw={600}>About</Text>
            <Text size="sm">Hello this is my beautiful account</Text>
          </Box>
          <Box mb={12}>
            <Text fw={600} mb={8}>
              Skills
            </Text>
            <Group gap={8}>
              <Badge color="blue" variant="light" size="lg">
                JavaScript
              </Badge>
              <Badge color="blue" variant="light" size="lg">
                React
              </Badge>
              <Badge color="blue" variant="light" size="lg">
                TypeScript
              </Badge>
              <Badge color="green" variant="light" size="lg">
                Python
              </Badge>
              <Badge color="green" variant="light" size="lg">
                Node.js
              </Badge>
              <Badge color="orange" variant="light" size="lg">
                SQL
              </Badge>
              <Badge color="purple" variant="light" size="lg">
                Git
              </Badge>
              <Badge color="gray" variant="light" size="lg">
                Docker
              </Badge>
            </Group>
          </Box>
          <Box w="100%" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="filled">Edit Profile</Button>
          </Box>
        </Box>
      </Card>
    </div>
  );
}
