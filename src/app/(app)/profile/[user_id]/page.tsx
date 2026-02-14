"use client"
/* TODO: Figure out how to get the comments on each post *I think the right move is to have a join on posts and comments with the same postid* */
// TODO: Figure out profile pictures
// TODO: CREATE THE FOLLOWING/FOLLOWED relationships
// TODO: READ TANSTACK DOCS (Need to understand queries, invalidating queries, and mutations)
// TODO: FIGURE OUT THE OPENGRAPH docs for sharing across whole platform
// TODO: FIGURE OUT THE ROUTING so that it passes the user_id otw to this profile page
import LSProfileHero from "@/components/profile/ls-profile-hero"
import LSPost from "@/components/profile/ls-post"
import LSMiniProfileList from "@/components/profile/ls-mini-profile-list";
import { Box, Divider, Flex, Stack } from "@mantine/core";
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';



import { useUserProfile, useUserPosts } from "@/components/profile/use-profile";
import { useParams } from "next/navigation";

const LSProfileMobileLayout = () => {

  const params = useParams<{ user_id: string }>();
  const profile = useUserProfile(params.user_id);
  const username = profile.data?.first_name + " " + profile.data?.last_name;
  const userPosts = useUserPosts(params.user_id);
  const listPosts = userPosts.data?.posts.map(post =>
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

  )

  return (
    <Stack p={8}>
      <LSProfileHero
        profileName={username}
        profileInstitution="Univ. of Central Florida"
        profileRole="Student"
        profileResearchInterest="Machine Learning"
        profileAbout="Hello this is my beautiful account"
        profileSkills={[
          "JavaScript",
          "More JavaScript",
          "Even MORE JavaScript!",
          "More More JAVASCRIPT More!!!",
          "php...!?",
        ]}
        profilePicURL="https://ih1.redbubble.net/image.5595885630.8128/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg"
        profileHeaderImageURL="https://external-preview.redd.it/r6g38aXSaQWtd1KxwJbQ-Fs5jtSVDxX3wtLHJEdqixw.jpg?width=1080&crop=smart&auto=webp&s=87a2c94cb3e1561e2b6abd467ea68d81b9901720"
      />
      {listPosts}
      <LSMiniProfileList widgetTitle="Friends" />
      <LSMiniProfileList
        widgetTitle="Following"
        profiles={[
          {
            key: 0,
            posterName: "Beethoven",
            posterResearchInterest: "European Music",
            posterProfilePicURL:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxuN8XD4da9_EVO8m6ZP4aECjlYM8mBkbTg&s",
          },
          {
            key: 1,
            posterName: "2Pac Shakur",
            posterResearchInterest: "Rap",
            posterProfilePicURL:
              "https://npr.brightspotcdn.com/dims4/default/3ef5a7e/2147483647/strip/true/crop/2814x2110+0+0/resize/880x660!/quality/90/",
          },
        ]}
      />
    </Stack>
  )
}

const LSProfileDesktopLayout = () => {

  const params = useParams<{ user_id: string }>();
  const profile = useUserProfile(params.user_id);
  const username = profile.data?.first_name + " " + profile.data?.last_name;
  const userPosts = useUserPosts(params.user_id);
  const listPosts = userPosts.data?.posts.map(post =>
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
  )

  return (
    <Box py={24} px={80}>
      <Flex p={8} direction="row" w="100%" gap={8}>
        <Box flex={5}>
          <LSProfileHero
            profileName={username}
            profileInstitution="Univ. of Central Florida"
            profileRole="Student"
            profileResearchInterest="Machine Learning"
            profileAbout="Hello this is my beautiful account"
            profileSkills={[
              "JavaScript",
              "php...!?",
            ]}
            profilePicURL="https://ih1.redbubble.net/image.5595885630.8128/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg"
            profileHeaderImageURL="https://external-preview.redd.it/r6g38aXSaQWtd1KxwJbQ-Fs5jtSVDxX3wtLHJEdqixw.jpg?width=1080&crop=smart&auto=webp&s=87a2c94cb3e1561e2b6abd467ea68d81b9901720"
          />
        </Box>
        <Flex flex={3} direction="column" gap={8}>
          <Box flex={3}>
            <LSMiniProfileList widgetTitle="Friends" />
          </Box>
          <Box flex={5}>
            <LSMiniProfileList
              widgetTitle="Following"
              profiles={[
                {
                  key: 0,
                  posterName: "Beethoven",
                  posterResearchInterest: "European Music",
                  posterProfilePicURL:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxuN8XD4da9_EVO8m6ZP4aECjlYM8mBkbTg&s",
                },
                {
                  key: 1,
                  posterName: "2Pac Shakur",
                  posterResearchInterest: "Rap",
                  posterProfilePicURL:
                    "https://npr.brightspotcdn.com/dims4/default/3ef5a7e/2147483647/strip/true/crop/2814x2110+0+0/resize/880x660!/quality/90/",
                },
              ]}
            />
          </Box>
        </Flex>
      </Flex >
      {/* posts */}
      <Divider my={20} color="navy.1" />
      <Stack mt={20} px="20%">
        {listPosts}
      </Stack>
    </Box >
  )
}

export default function ProfilePage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return isMobile ?
    <LSProfileMobileLayout /> :
    <LSProfileDesktopLayout />
}
