"use client" // TODO: Why tf do we need this?

import ProfileWidget from "@/components/profile/profile-widget"
import Post from "@/components/profile/post"
import ProfileListWidget from "@/components/profile/profile-list-widget";
import { Container, Grid, Stack } from "@mantine/core";

export default function ProfilePage() {
  return (
    <Container size="xl" my="lg">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            <ProfileWidget
              profileName="Rafael Niebles"
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

            <Post
              posterName="Rafael Niebles"
              posterResearchInterest="JavaScript Hater"
              posterProfilePicURL="https://pbs.twimg.com/media/DUzbwUdX4AE5RGO.jpg"
              attachmentPreviewURL="https://s3-eu-west-1.amazonaws.com/images.linnlive.com/d4cf250f63918acf8e5d11b6bfddb6ba/9250355b-75cf-42d8-957b-6d28c6aa930f.jpg"
              timestamp={new Date()}
              postText="I think JavaScript is a crime against humanity and it should be explodonated"
            />
          </Stack >
        </Grid.Col >
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <ProfileListWidget widgetTitle="Friends" />
            <ProfileListWidget
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
        </Grid.Col>
      </Grid >
    </Container >
  );
}
