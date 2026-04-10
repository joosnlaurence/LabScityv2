'use client';

import { GetCollaboratorsResult } from "@/lib/types/collab";
import { 
  Anchor, 
  Avatar, 
  Badge, 
  Box, 
  Button, 
  Card, 
  Divider, 
  Flex, 
  Group, 
  Stack, 
  Text, 
  UnstyledButton, 
} from "@mantine/core";
import { Fragment } from "react/jsx-runtime";
import { 
  IconChevronRight, 
  IconMessageCircle, 
  IconRefresh, 
  IconStarFilled, 
  IconUserPlus 
} from "@tabler/icons-react";
import Link from 'next/link';
import CollabRecommendationsSkeleton from "./collab-recommendations-skeleton";

// import { useDisclosure } from "@mantine/hooks";
import classes from './collab-recommendations.module.css';
import { useQuery } from "@tanstack/react-query";

interface CollabProfileProps {
  percentMatch: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  occupation: string | null;
  workplace: string | null;
  last: boolean;
  closestTopics: string[];
}

function CollabProfile (
  {
    percentMatch, 
    userId, 
    firstName, 
    lastName, 
    avatarUrl, 
    occupation,
    workplace,
    last,
    closestTopics
  }
  : 
  CollabProfileProps 
) {
  const userName = `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0]}${lastName[0]}`
  const hasMiddot = occupation && workplace;
  let similarityColor = 'gray';
  if(percentMatch >= 85)
    similarityColor = 'teal';
  else if(percentMatch >= 60)
    similarityColor = 'blue';

  return (
    <>
      <Group
        p='0.75rem 1rem'
        wrap='nowrap' 
        mr='1rem'
        style={{ 
          padding: '0.75rem 1rem',
          wrap: 'nowrap',
          marginRight: '1rem',
          overflow: 'hidden' 
        }}
      >
        <Anchor
          component={Link}
          href={`/profile/${userId}`}
          underline='never'
          miw='0'
          draggable={false}
        >
          <Group 
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
            <Stack 
              gap='0' 
              style={{ flex: 1, overflow: 'hidden' }}
            >
              <Box lh='0'>
                <Text 
                  component="span" 
                  fw='600'
                  fz='0.875rem'
                  c="navy.7" 
                  lh='0.875rem'
                  style={{ display: 'inline' }}
                  className={classes.headerName}
                >
                  {userName}
                </Text>
              </Box>
              <Text
                fz='0.6875rem'
                fw='400'
                c='dimmed'
                truncate='end'
                mt='2px'
              >
                {`${occupation || ''}${hasMiddot ? ' · ': ''}${workplace || ''}`}
              </Text>
              <Group 
                gap='4px' 
                mt='4px'
              >
                {
                  closestTopics.map((topic, i) => 
                    <Badge
                      key={i}
                      bg='gray.2'
                      c='navy.7'
                      fw='500'
                      tt='none'
                      fz='0.625rem'
                      style={{ cursor: 'pointer' }}
                    >
                      {topic}
                    </Badge>
                  )
                }
              </Group>
              <Badge
                bg={`${similarityColor}.1`}
                mt='4px'
                bd={`1px solid ${similarityColor}.3`}
                p='2px 6px'
                style={{ cursor: 'pointer' }}
              >
                <Group wrap='nowrap' gap='2'>
                  <IconStarFilled 
                    color={`var(--mantine-color-${similarityColor}-8)`}
                    size='12'
                  />
                  <Text
                    fz='0.625rem'
                    fw='600'
                    c={`${similarityColor}.8`}
                  >
                    {percentMatch}%
                  </Text>
                </Group>
              </Badge>
            </Stack>
          </Group>
        </Anchor>
        <Stack 
          flex='1'
          align='flex-end'
          gap='6px'
        >
          <Button
            bg='navy.7'
            bdrs='8px'
            p='6px 10px'
            fz='0.75rem'
            className={classes.followBtn}
          >
            <Group 
              gap='4px' 
              wrap='nowrap' 
            >
              <IconUserPlus size='0.75rem' stroke='2.2'/>
              <Text fz='0.75rem' fw='500'>
                Follow
              </Text>
            </Group>
          </Button>
          <UnstyledButton p='4px'>
            <IconMessageCircle 
              size='1.25rem'
              stroke='1.5'
              color='var(--mantine-color-dimmed)'
            />
          </UnstyledButton>
        </Stack>
      </Group>
      { last && <Divider mr='1rem' color='gray.2'/> }
    </>
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

  if(error) {
    console.error(error.message);
  }

  return (
    <Card 
      bg="gray.0" 
      p="0" 
      w="100%" 
      radius="md" 
      bd='1px solid gray.3'
      bdrs="lg"
      shadow="sm"
    >
      <Stack gap='0'>
        <Group
          p='0.875rem 1rem'
          wrap='nowrap'
          justify='space-between'
          style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
          gap='0'
        >
          <Stack gap='2'>
            <Text
              c="navy.7"
              fw="600"
              fz="md"
              lh='1.2rem'
              style={{ wordBreak: 'break-word' }}
            >
              Recommended Collaborators
            </Text>
            <Text
              c='dimmed'
              fz='xs'
              lh='1rem'
            >
              Based on your research and skills
            </Text>
          </Stack>
          <Group wrap='nowrap' gap='4px'>
            <UnstyledButton
              display='flex'
              p='8px'
              bdrs='100px'
              className={classes.headerBtn}
            >
              <IconRefresh
                size='1.25rem'
                color='var(--mantine-color-dimmed)'
                stroke='1.5'
                style={{ flexShrink: 0 }}
              />
            </UnstyledButton>
            {
              !error
              ? 
              <UnstyledButton
                ta='center'
                fz='xs'
                c='indigo.9'
                fw='500'
                p='8px'
                bdrs='100px'
                className={classes.headerBtn}
              >
                <Flex 
                  wrap='nowrap'
                  justify='flex-end'
                  align='center'
                >
                  See all
                  <IconChevronRight
                    size='0.75rem'
                    color='currentColor'
                    stroke='2.5'
                    style={{ flexShrink: 0 }}
                  />
                </Flex>
              </UnstyledButton>
              : undefined
            }
          </Group>
        </Group>
        <Stack gap='0'>
          {
            (!error && collabs) 
            ?
            collabs
            .map((c, i) => 
              <Fragment key={c.profile_user_id}>
                <CollabProfile 
                  percentMatch={parseInt((c.cosine_similarity*100).toFixed(2))}
                  userId={c.profile_user_id}
                  firstName={c.first_name}
                  lastName={c.last_name}
                  avatarUrl={c.profile_pic_path}
                  occupation={c.occupation}
                  workplace={c.workplace}
                  last={i < collabs.length - 1}
                  closestTopics={['Topically 1', 'Topically 2', 'Topically 3']}
                />
              </Fragment>
            )
            : 
            <Stack gap='0' p='0.75rem 1rem'>
              <Text c='red.7' fw='700'>
                Error:
              </Text>
              <Text c='red.7'>
                Unexpected error occurred trying to find collaborators...
              </Text>
            </Stack>
          }
        </Stack>
      </Stack>
    </Card>
  );
}