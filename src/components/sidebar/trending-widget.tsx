import { Card, Text, Stack, Flex, Badge } from "@mantine/core";
import { getTrendingScientificFields } from "@/lib/actions/feed";
import Hashtag from "./hashtag";

export async function TrendingWidget() {
  let hashtags: string[] = Array(5).fill('FeedMeMorePosts');;
  
  try {
    const res = await getTrendingScientificFields();
    if(res.success && res.data) {
      hashtags = res.data.hashtags;
    }
  } catch {}

  return (
    <Card
      bg="gray.0"
      p="md"
      w="100%"
      h="100%"
      radius="md"
      shadow="sm"
    >
      <Stack gap="md">
        <Text
          c="gray.7"
          fw="bold"
          fz="xl"
        >
          Trending
        </Text>
          <Flex wrap="wrap" gap={6} justify="flex-start">
            {
              hashtags.map((hashtag, index) => (
                <Hashtag key={index} hashtag={hashtag}/>
              ))
            }
          </Flex>
      </Stack>
    </Card >
  );
}
