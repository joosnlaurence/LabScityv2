import { Modal, Stack } from "@mantine/core";
import type { User } from "@/lib/types/feed";
import LSMiniProfile from "@/components/profile/ls-mini-profile";

export interface LSProfileListModalProps {
  title: string;
  profiles: User[];
  opened: boolean;
  onClose: () => void;
}

/**
 * Scrollable modal that displays a full list of user profiles.
 * Shared by the Friends and Following widgets on the profile page.
 */
export default function LSProfileListModal({
  title,
  profiles,
  opened,
  onClose,
}: LSProfileListModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size="md"
      styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
    >
      <Stack gap={12}>
        {profiles.map((profile) => (
          <LSMiniProfile
            key={profile.user_id}
            userId={profile.user_id}
            posterEmail={profile.email}
            posterName={profile.first_name + " " + profile.last_name}
            posterResearchInterest={profile.research_interests?.at(0) ?? ""}
            posterProfilePicURL={profile.avatar_url ?? undefined}
          />
        ))}
      </Stack>
    </Modal>
  );
}
