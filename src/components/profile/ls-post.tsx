import { Menu, Group, Button, Text, Image, Card, Box, Avatar, ActionIcon } from "@mantine/core";
import { IconDots, IconHeart, IconHeartFilled, IconMessageCircle, IconPencil, IconShare, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const LSPostActionMenu = () => {
  return (
    <Menu>
      {/* Action button to trigger menu */}
      <Menu.Target>
        <ActionIcon variant="transparent" size="sm">
          <IconDots size={18} style={{ color: "var(--mantine-color-navy-6)" }} />
        </ActionIcon>
      </Menu.Target>

      {/* Menu dropdown itself  */}
      <Menu.Dropdown>
        <Menu.Label c="navy.6">Post Options</Menu.Label>
        {/* Edit */}
        <Menu.Item c="navy.7" leftSection={<IconPencil size={14} />}>
          Edit Post
        </Menu.Item>
        {/* Delete */}
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}>
          Delete Post
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

const LSPostLikeButton = () => {
  const [active, setActive] = useState(false)

  return (
    <Button
      c="navy.6"
      variant="transparent"
      leftSection={active ?
        <IconHeartFilled size={18} color="red" /> : // fill with red if active
        <IconHeart size={18} />
      }
      size="compact-sm"
      style={{ alignItems: "center", textAlign: "center" }}
      onClick={() => setActive(!active)} // TODO: add api functionality here
    >
      Like
    </Button>
  )
}

interface LSPostProps {
  posterName: string,
  posterResearchInterest: string,
  posterProfilePicURL: string,
  attachmentPreviewURL: string,
  timestamp: Date,
  postText: string
}

export default function LSPost({
  posterName,
  posterResearchInterest,
  posterProfilePicURL: posterProfilePic,
  attachmentPreviewURL,
  timestamp,
  postText
}: LSPostProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md">
      <Box>
        <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar radius="xl" src={posterProfilePic} />
          <Box style={{ flex: 1 }}>
            <Group mb={2}>
              <Text c="navy.8" size="lg" fw={600} span>
                {posterName}
              </Text>
              <Box
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <LSPostActionMenu />
              </Box>
            </Group>
            <Text c="navy.7" mt={-4} size="sm">
              {posterResearchInterest}
            </Text>
          </Box>
        </Box>
        <Text c="navy.8" size="sm" my={12} style={{ lineHeight: 1.2 }}>
          {postText}
        </Text>
        <Image radius="md" w="100%" src={attachmentPreviewURL} />
        <Text size="sm" c="navy.5" ml={2} my={12}>
          {timestamp.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}{" "}
          •{" "}
          {timestamp.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <LSPostLikeButton />
          <Button
            c="navy.6"
            variant="transparent"
            leftSection={<IconMessageCircle size={18} />}
            size="compact-sm"
            style={{ alignItems: "center", textAlign: "center" }}
          >
            Comment
          </Button>
          <Button
            c="navy.6"
            variant="transparent"
            leftSection={<IconShare size={18} />}
            size="compact-sm"
            style={{ alignItems: "center", textAlign: "center" }}
          >
            Share
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
