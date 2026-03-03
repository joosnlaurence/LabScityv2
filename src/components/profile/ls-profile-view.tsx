"use client";

// Renders the full profile view (hero, posts, friends/following)
// for a given userId using TanStack Query hooks.
import { Box, Divider, Flex, Stack } from "@mantine/core";
import { LSSpinner } from "@/components/ui/ls-spinner";
import { useIsMobile } from "@/app/use-is-mobile";
import { useUserFollowing, useUserFriends, useUserPosts, useUserProfile } from "@/components/profile/use-profile";
import LSMiniProfileList from "@/components/profile/ls-mini-profile-list";
import LSPost from "@/components/profile/ls-post";
import LSProfileHero from "@/components/profile/ls-profile-hero";

interface LSProfileViewProps {
  userId: string;
  isOwnProfile: boolean;
}

const LSProfileMobileLayout = ({ userId }: { userId: string }) => {
  const profile = useUserProfile(userId);
  const username =
    profile.userProfile?.first_name + " " + profile.userProfile?.last_name;
  const userPosts = useUserPosts(userId);
  const following = useUserFollowing(userId);
  const friends = useUserFriends(userId);

  const listPosts = userPosts.userPosts?.posts.map((post) => (
    <li key={post.post_id}>
      <LSPost
        posterName={username}
        posterResearchInterest="This isn't in the database"
        attachmentPreviewURL="urlurl"
        posterProfilePicURL="profilepicurl"
        postText={post.text || ""}
        timestamp={post.created_at}
      />
    </li>
  ));

  return (
    <Stack p={8}>
      <LSProfileHero
        profileName={username}
        profileInstitution="profileInstitution n/a"
        profileRole="profileRole n/a"
        profileResearchInterest="profileResearchInterest n/a"
        profileAbout="profileAbout n/a"
        profileSkills={["profileSkills n/a"]}
        profilePicURL="profilePicURL n/a"
        profileHeaderImageURL="profileHeaderImageURL n/a"
      />
      {listPosts}
      <LSMiniProfileList widgetTitle="Friends" profiles={friends.data} />
      <LSMiniProfileList
        widgetTitle="Following"
        profiles={following.data}
      />
    </Stack>
  );
};

const LSProfileDesktopLayout = ({ userId }: { userId: string }) => {
  const profile = useUserProfile(userId);
  const username =
    profile.userProfile?.first_name + " " + profile.userProfile?.last_name;
  const userPosts = useUserPosts(userId);
  const friends = useUserFriends(userId);
  const following = useUserFollowing(userId);

  if (profile.status === "pending") {
    return (
      <Flex justify="center" align="center" h="calc(100vh - 120px)">
        <LSSpinner />
      </Flex>
    );
  }

  if (profile.status === "error") {
    return <div> Error loading Profile... </div>;
  }

  const friendIds = new Set(friends.data?.map((friend) => friend.user_id));

  const notFollowedBack = following.data?.filter(
    (user) => !friendIds.has(user.user_id),
  );

  const listPosts = userPosts.userPosts?.posts.map((post) => (
    <li key={post.post_id}>
      <LSPost
        posterName={username}
        posterResearchInterest="posterResearchInterest n/a"
        attachmentPreviewURL="attachmentPreviewURL n/a"
        posterProfilePicURL="posterProfilePicURL n/a"
        postText={post.text || "postText n/a"}
        timestamp={post.created_at}
      />
    </li>
  ));

  return (
    <Box py={24} px={80}>
      <Flex p={8} direction="row" w="100%" gap={8}>
        <Box flex={5}>
          <LSProfileHero
            profileName={username}
            profileInstitution="profileInstitution n/a"
            profileRole="profileRole n/a"
            profileResearchInterest="profileResearchInterest n/a"
            profileAbout="profileAbout n/a"
            profileSkills={["profileSkills n/a"]}
            profilePicURL="profilePicURL n/a"
            profileHeaderImageURL="profileHeaderImageURL n/a"
          />
        </Box>
        <Flex flex={3} direction="column" gap={8}>
          <Box flex={3}>
            <LSMiniProfileList widgetTitle="Friends" profiles={friends.data} />
          </Box>
          <Box flex={5}>
            <LSMiniProfileList
              widgetTitle="Following"
              profiles={notFollowedBack}
            />
          </Box>
        </Flex>
      </Flex>
      {/* posts */}
      <Divider my={20} color="navy.1" />
      <Stack mt={20} px="20%">
        {listPosts}
      </Stack>
    </Box>
  );
};

export function LSProfileView({ userId, isOwnProfile }: LSProfileViewProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <LSProfileMobileLayout userId={userId} />
  ) : (
    <LSProfileDesktopLayout userId={userId} />
  );
}

