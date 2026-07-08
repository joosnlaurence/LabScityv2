import { Box, Button, Card, Center, Divider, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import LSPublicationsList from "../publications/ls-publications-list";
import { IconArticle, IconBox, IconBriefcase, IconMessageCircle, IconProps } from "@tabler/icons-react";
import { ComponentType, useState } from "react";
import { BookmarkCategory, SavedItemsData, SavedPostRow } from "@/lib/types/bookmarks";
import { useBookmarkCounts, useBookmarks } from "./use-bookmarks";
import classes from './ls-bookmarks.module.css';
import LSPublication from "../publications/ls-publication";
import LSProduct from "../products/ls-product";
import { JobCard } from "@/components/jobs/jobs-page";
import { FeedPostCard } from "@/components/feed/home-feed";
import { getTimeAgo } from "../ls-profile-view";
import { FeedPostItem } from "@/lib/types/feed";
import { useSetSavedPost } from "@/components/feed/use-feed";
import LSBookmarksList from "./ls-bookmarks-list";

function ItemCount({count}: {count: number}) {
  return (
    <Box bg='navy.5' bdrs='100' px='6'>
      <Text fz='xs' c='white'>{count > 99 ? "99+" : count}</Text>
    </Box>
  )
}

const BOOKMARK_TABS: {
  category: BookmarkCategory;
  label: string;
  icon: ComponentType<IconProps>;
}[] = [
  { category: "posts", label: "Posts", icon: IconMessageCircle },
  { category: "publications", label: "Publications", icon: IconArticle },
  { category: "products", label: "Products", icon: IconBox},
  { category: "jobs", label: "Jobs", icon: IconBriefcase},
];

export function LSBookmarks({userId}: {userId: string}) {
  const [activeTab, setActiveTab] = useState<BookmarkCategory>("posts");

  const bookmarkCounts = useBookmarkCounts(userId);
  const bookmarks = useBookmarks(userId);
  bookmarks.data
  if(bookmarkCounts.isPending || bookmarks.isPending) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  return (
    <Group wrap='nowrap' w='100%' align='start' pb='300'>
      <Card
        p='xs'
        bd='1px solid gray.3'
        shadow='xs'
      >
        <Stack gap='xs'>
          {BOOKMARK_TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = tab.category === activeTab;
 
            return (
              <Box key={tab.category}>
                <UnstyledButton
                  w='100%'
                  style={{
                    borderLeft: isActive ? '2px solid var(--mantine-color-navy-7)' : '2px solid transparent',
                    borderRadius: isActive ? "0 var(--mantine-radius-md) var(--mantine-radius-md) 0" : "var(--mantine-radius-md)"
                  }}
                  className={classes.tab}
                  onClick={() => setActiveTab(tab.category)}
                  p='xs'
                >
                  <Group wrap='nowrap' justify="space-between">
                    <Group wrap='nowrap' gap='xs'>
                      <Icon stroke={1.5} />
                      <Text className={classes.tabLabel} data-active={isActive || undefined} fz='sm' style={{ whiteSpace: 'nowrap' }}>
                        {tab.label}
                      </Text>
                    </Group>
                    <ItemCount count={bookmarkCounts.data?.[tab.category] ?? 0} />
                  </Group>
                </UnstyledButton>
              </Box>
            );
          })}
        </Stack>
      </Card>
      <Box flex='1'>
        <LSBookmarksList userId={userId} category={activeTab} data={bookmarks.data}/>
      </Box>
    </Group>
  )
}