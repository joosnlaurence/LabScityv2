'use client';

import { GetCollaboratorsResult } from "@/lib/types/collab";
import { Anchor, Avatar, Box, Button, Card, Divider, Group, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import classes from './collab-recommendations.module.css';
import { Fragment } from "react/jsx-runtime";

function CollabHeaderSkeleton() {
  return (
    <Group align="center" wrap='nowrap' style={{ overflow: 'hidden' }}>
      <Skeleton mih='38' h='0%' miw='38' w='0%' circle/>
      <Skeleton h={16} w='100%'/>
    </Group>
  )
}

function CollabRecommendationsSkeleton() {
  return (
    <Card bg="gray.0" p="md" w="100%" radius="md" bd='1px solid gray.3'>
      <Stack gap='16'>
        <Text
          c="gray.7"
          fw="bold"
          fz="xl"
          style={{ wordBreak: 'break-word' }}
        >
          Recommended Collaborators
        </Text>
        <Stack>
          {
            Array.from({ length: 5 }).map((_, i) => 
              <CollabHeaderSkeleton key={i}/>
            )
          }
        </Stack>
      </Stack>
    </Card>
  )
}

function CollabHeader (
  {userId, firstName, lastName, avatarUrl}
  : 
  {userId: string, firstName: string, lastName: string, avatarUrl: string | null}
) {
  const userName = `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0]}${lastName[0]}`
      
  return (
    <UnstyledButton
      component={Link} 
      href={`/profile/${userId}`} 
      p='6'
      bdrs='lg'
      className={classes.collabHeader}
    >
      <Group 
        bdrs='md' 
        gap="sm" 
        align="center" 
        wrap='nowrap' 
        style={{ overflow: 'hidden' }}
      >
        <Avatar
          size="md"
          radius="xl"
          color="navy.7"
          bg="navy.7"
          src={avatarUrl || undefined}
        >
          {initials}
        </Avatar>

        <Stack gap={-1}>
          <Text 
            component="span" 
            fw={700} 
            c="navy.7" 
            lh={1.1}
            className={classes.headerName}
          >
            {userName}
            {/* {audienceLabel ? (
              <Text component="span" ml="xs" size="xs" fw={600} c="navy.7">
                {audienceLabel}
              </Text>
            ) : null} */}
          </Text>
          {/* <Text c="navy.7" size="sm" mt={-4}>{field}</Text> */}
        </Stack>
      </Group>
    </UnstyledButton>
  )
};

export default function CollabRecommendations() {
  const { data: collabs, isLoading, error } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const res = await fetch('/api/collaborators');
      const data: GetCollaboratorsResult[] = await res.json();
      
      return data;
    }
  }) 

  if (isLoading) {
    return (
      <CollabRecommendationsSkeleton />
    )
  }

  if (error) {
    console.error(error);
    return (
      <Card bg="gray.0" p="md" w="100%" radius="md" bd='1px solid gray.3'>
        <Stack gap='16'>
          <Text
            c="gray.7"
            fw="bold"
            fz="xl"
            style={{ wordBreak: 'break-word' }}
          >
            Recommended Collaborators
          </Text>
          <Stack gap='0'>
            <Text c='red.7' fw='700'>
              Error:
            </Text>
            <Text c='red.7' style={{ wordBreak: 'break-word' }}>
              Unexpected error occurred trying to find collaborators...
            </Text>
          </Stack>
        </Stack>
      </Card>
    )
  }

  console.log(collabs)
  return (
    <Card bg="gray.0" p="md" w="100%" radius="md" bd='1px solid gray.3'>
      <Stack gap='16'>
        <Text
          c="gray.7"
          fw="bold"
          fz="xl"
          style={{ wordBreak: 'break-word' }}
        >
          Recommended Collaborators
        </Text>
        <Stack gap='0'>
          {
            collabs?.map((c, i) => 
              <Fragment key={c.profile_user_id}>
                <CollabHeader 
                  userId={c.profile_user_id}
                  firstName={c.first_name}
                  lastName={c.last_name}
                  avatarUrl={c.profile_pic_path}
                />
                {i < collabs.length-1 &&
                  <Divider color='gray.3' mt='3' mb='3'/>
                }
              </Fragment>
            )
          }
        </Stack>
      </Stack>
    </Card>
  );
}