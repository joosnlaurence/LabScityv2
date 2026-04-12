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
  Modal,
  ActionIcon,
  TextInput,
  Chip,
  SimpleGrid
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Fragment } from "react/jsx-runtime";
import { 
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronRight, 
  IconMessageCircle, 
  IconRefresh, 
  IconSearch, 
  IconStarFilled, 
  IconUserPlus, 
  IconXFilled
} from "@tabler/icons-react";
import Link from 'next/link';
import CollabRecommendationsSkeleton from "./collab-recommendations-skeleton";
import { ReactNode, useState } from 'react';

import classes from './collab-recommendations.module.css';
import { useQuery } from "@tanstack/react-query";

interface CollabProfileProps {
  percentMatch: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  openToCollab: boolean;
  about?: string | null;
  last?: boolean;
  closestTopics: string[];
}

function PercentMatchBadge({percentMatch, text}: {percentMatch: number, text?: string}) {
  let similarityColor = 'gray';
  if(percentMatch >= 85)
    similarityColor = 'teal';
  else if(percentMatch >= 60)
    similarityColor = 'blue';

  return (
    <Badge
      bg={`${similarityColor}.1`}
      mt='4px'
      bd={`1px solid ${similarityColor}.3`}
      p='2px 6px'
      tt='none'
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
          {percentMatch}% {text}
        </Text>
      </Group>
    </Badge>
  );
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
    openToCollab = false,
    last,
    closestTopics
  }
  : 
  CollabProfileProps 
) {
  const userName = `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0]}${lastName[0]}`
  const hasMiddot = occupation && workplace;

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
              bg="navy.7"
              src={avatarUrl || undefined}
            >
              {initials}
            </Avatar>
            <Stack 
              gap='0' 
              style={{ flex: 1, overflow: 'hidden' }}
            >
              <Group gap='6' wrap='nowrap'>
                <Text 
                  component="span" 
                  fw='600'
                  fz='0.875rem'
                  lh='0.875rem'
                  style={{ display: 'inline' }}
                  c='var(--mantine-color-text)'
                  className={classes.headerName}
                >
                  {userName}
                </Text>
                {
                  openToCollab &&
                  <Badge
                    color='green.2'
                    c='green.9'
                    tt='none'
                    p='2px 6px'
                    style={{flexShrink: 0}}
                  >
                    Open
                  </Badge>
                }
              </Group>
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
                      c='var(--mantine-color-text)'
                      fw='500'
                      tt='none'
                      fz='0.625rem'
                      p='1.5px 8px 2.5px 8px'
                      style={{ cursor: 'pointer' }}
                    >
                      {topic}
                    </Badge>
                  )
                }
              </Group>
              <PercentMatchBadge percentMatch={percentMatch}/>
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
              <IconUserPlus size='0.875rem' stroke='2.2'/>
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

function CollabProfileCard(
  {
    percentMatch, 
    userId, 
    firstName, 
    lastName, 
    avatarUrl, 
    occupation,
    workplace,
    openToCollab,
    about,
    closestTopics
  }
  : 
  CollabProfileProps 
) {
  const userName = `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0]}${lastName[0]}`
  const hasMiddot = occupation && workplace;

  return (
    <Card
      w='100%'
      bd='1px solid gray.3'
      p='0'
      bdrs='0.75rem'
      c='navy.7'
    >
      <Group 
        p='1rem' 
        gap='0.875rem' 
        wrap='nowrap'
        align="flex-start"
      >
        {/* Avatar and Open Badge */}
        <Stack gap='0.5rem' align='center'>
          <Avatar
            size="48"
            radius="xl"
            bg="navy.7"
            src={avatarUrl || undefined}
          >
            {initials}
          </Avatar>
          {
            openToCollab &&
            <Badge
              color='green.2'
              c='green.9'
              tt='none'
              p='2px 6px'
            >
              Open
            </Badge>
          }
        </Stack>
        
        {/* Profile Details */}
        <Stack w='100%' gap='0'>
          {/* Full Name and Percent Match Badge */}
          <Group justify='space-between'>
            <Text 
              fw='600'
              fz='0.875rem'
              lh='1.25rem '
              style={{ display: 'inline' }}
              className={classes.headerName}
            >
              {userName}
            </Text>
            <PercentMatchBadge percentMatch={percentMatch} text='Match'/>
          </Group>
          {/* Occupation + Workplace */}
          <Text
            fz='0.75rem'
            fw='400'
            lh='1.125rem'
            c='dimmed'
            truncate='end'
            mb='6px'
          >
            {`${occupation || ''}${hasMiddot ? ' · ': ''}${workplace || ''}`}
          </Text>
          <Text
            fz='0.75rem'
            fw='400'
            lh='1.25rem'
            lineClamp={3}
            mb='8px'
          >
            {about}
          </Text>
          {/* Closest Topics */}
          <Group gap='0 4px' mb='10px'>
            {
              closestTopics.map((topic, i) => 
                <Badge
                  key={i}
                  bg='gray.2'
                  p='1.5px 8px 2.5px 8px'
                  c='var(--mantine-color-text)'
                  fw='500'
                  tt='none'
                  fz='0.625rem'
                >
                  {topic}
                </Badge>
              )
            }
          </Group>
          {/* Follow and DM Buttons */}
          <Group gap='8'>
            <Button
              bg='navy.7'
              bdrs='8px'
              p='6px 12px'
              className={classes.followBtn}
              leftSection={<IconUserPlus size='0.75rem' stroke='2.2'/>}
              styles={{ section: { marginInlineEnd: '4px'} }}
            >
              <Text fz='0.75rem' fw='500'>
                Follow
              </Text>
            </Button>
            <Button
              variant='outline'
              bdrs='8px'
              p='6px 12px'
              leftSection={<IconMessageCircle size='0.875rem' stroke='2.2'/>}
              styles={{ section: { marginInlineEnd: '4px'} }}
              c='navy.7'
              bd='1px solid gray.3'
            >
              <Text fz='0.75rem' fw='500'>
                Message
              </Text>
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

function LSChip (
  {defaultChecked, value, children}
  :
  {defaultChecked?: boolean, value: string, children: ReactNode}
) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <Chip 
      defaultChecked={defaultChecked} 
      icon={<></>} 
      value='all' 
      variant={checked ? 'filled' : 'outline'}
      styles={{
        iconWrapper: {
          display: 'none',
        },
        label: {
          paddingInline: '12px',
          paddingBlock: '6px'
        },
      }}
      onClick={() => setChecked(!checked)}
      color='navy.7'
    >
      <Text fz='0.75rem' c={checked ? 'white' : 'navy.7'}>{children}</Text>
    </Chip>
  )
}

export default function CollabRecommendations() {
  const [opened, {open, close}] = useDisclosure(false);

  const { data: collabs, isLoading, error } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const res = await fetch('/api/collaborators');
      const data: GetCollaboratorsResult[] = await res.json();
      
      return data;
    },
    select: (collabs) => collabs.map((c) => ({
      percentMatch: parseInt((c.cosine_similarity*100).toFixed(2)),
      userId: c.profile_user_id,
      firstName: c.first_name,
      lastName: c.last_name,
      avatarUrl: c.profile_pic_path,
      occupation: c.occupation,
      workplace: c.workplace,
      openToCollab: true,
      about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      closestTopics: ['Topically 1', 'Topically 2', 'Topically 3']
    }))
  }) 

  if (isLoading) {
    return (
      <CollabRecommendationsSkeleton />
    )
  }

  if(error) {
    console.error(error.message);
  }

  const num_collabs = collabs?.length ?? 0;


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
      <Modal.Root opened={opened} onClose={close} size='900px'>
        <Modal.Overlay />
        <Modal.Content bdrs="lg">
          <Modal.Header p='0'>
            <Group
              p='1rem 1.5rem'
              w='100%'
              wrap='nowrap'
              justify='space-between'
              style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
              gap='0'
            >
              <Stack gap='2'>
                <Text
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
                  Based on your research and skills · {num_collabs} match{num_collabs > 1 && 'es'} found
                </Text>
              </Stack>
              <Group gap='0.5rem'>
                <Button 
                  variant='outline'
                  c='dimmed'
                  bd='1px solid gray.3'
                  bdrs='md'
                  fw='400'
                  p='0.5rem 0.75rem'
                >
                  <Group gap='6px'>
                    <IconAdjustmentsHorizontal size='1rem' stroke='1.5'/>
                    Sort
                    <IconChevronDown size='0.75rem'/>
                  </Group>
                </Button>
                <ActionIcon
                  c='dimmed'
                  bd='1px solid gray.3'
                  bdrs='md'
                  p='4'
                  onClick={close}
                  variant='outline'
                >
                  <IconXFilled size='1rem'/>
                </ActionIcon>
              </Group>
            </Group>
          </Modal.Header>
          <Stack 
            p='0.75rem 1.5rem'
            gap='0.625rem'
            style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
          >
            <TextInput
              leftSection={<IconSearch size='16'/>}
              radius='12px'
              placeholder='Search by name, institution, or skill...'
            />
            <Group gap='0.5rem'>
              <LSChip defaultChecked={true} value='all'>
                All
              </LSChip>
              <LSChip value='open'>
                Open to collaborate
              </LSChip>
              <LSChip value='highMatch'>
                High match (85%+)
              </LSChip>
              <LSChip value='sameField'>
                Same field
              </LSChip>
            </Group>
          </Stack>
          <SimpleGrid 
            p='1.5rem'
            type='container'
            cols={{ base: 1, '400px': 2, }}
          >
            {
              collabs 
              ?
              collabs?.map((c) => 
                <CollabProfileCard 
                  key={c.userId}
                  {...c}
                  closestTopics={['Topically 1', 'Topically 2', 'Topically 3']}
                />
              )
              : undefined
            }
          </SimpleGrid>
        </Modal.Content>
      </Modal.Root>

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
                onClick={open}
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
              <Fragment key={c.userId}>
                <CollabProfile 
                  {...c}
                  last={i < collabs.length - 1}
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