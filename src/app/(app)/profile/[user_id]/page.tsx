"use client";
import { Box, Divider, Flex, Stack, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useParams } from "next/navigation";
import LSMiniProfile from "@/components/profile/ls-mini-profile";
import LSMiniProfileList from "@/components/profile/ls-mini-profile-list";
import LSPost from "@/components/profile/ls-post";
// TODO: CREATE THE FOLLOWING/FOLLOWED relationships
// TODO: FIGURE OUT THE ROUTING so that it passes the user_id otw to this profile page
/* TODO: Figure out how to get the comments on each post *I think the right move is to have a join on posts and comments with the same postid* */
// TODO: Figure out profile pictures
// TODO: READ TANSTACK DOCS (Need to understand queries, invalidating queries, and mutations)
// TODO: FIGURE OUT THE OPENGRAPH docs for sharing across whole platform
import LSProfileHero from "@/components/profile/ls-profile-hero";
import {
  useUserFollowing,
  useUserPosts,
  useUserProfile,
} from "@/components/profile/use-profile";

const LSProfileMobileLayout = () => {
  const params = useParams<{ user_id: string }>();
  const profile = useUserProfile(params.user_id);
  const username =
    profile.userProfile?.first_name + " " + profile.userProfile?.last_name;
  const userPosts = useUserPosts(params.user_id);
  const following = useUserFollowing(params.user_id);
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
      <LSMiniProfileList widgetTitle="Friends" />
      <LSMiniProfileList
        widgetTitle="Following"
        profiles={following.data}
      />
    </Stack>
  );
};

const LSProfileDesktopLayout = () => {
  const params = useParams<{ user_id: string }>();
  const profile = useUserProfile(params.user_id);
  const username =
    profile.userProfile?.first_name + " " + profile.userProfile?.last_name;
  const userPosts = useUserPosts(params.user_id);
  const following = useUserFollowing(params.user_id);


  if (profile.status === "pending") {
    return <div> Loading Profile... </div>;
  }

  if (profile.status === "error") {
    return <div> Error loading Profile... </div>;
  }

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
            {/* The two mini lists will need to be populated. follows table exists, it needs to be queried and a useQuery needs to be written and placed in use-profile?*/}
            <LSMiniProfileList widgetTitle="Friends" />
          </Box>
          <Box flex={5}>
            <LSMiniProfileList
              widgetTitle="Following"
              profiles={following.data}
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

export default function ProfilePage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return isMobile ? <LSProfileMobileLayout /> : <LSProfileDesktopLayout />;
}
