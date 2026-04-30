import type { Publication } from "@/lib/types/publication"
import { 
  ActionIcon,
  Anchor,
  Avatar,
  Badge, 
  Box, 
  Button, 
  Card, 
  Divider, 
  Group, 
  Popover, 
  Stack, 
  Text, 
} from "@mantine/core"
import { 
  IconBook, 
  IconBook2, 
  IconBooks, 
  IconChevronRight, 
  IconClipboardText, 
  IconClock, 
  IconDots, 
  IconEdit, 
  IconFile, 
  IconLink, 
  IconNotebook, 
  IconPdf, 
  IconPresentation, 
  IconSchool, 
  IconStarFilled,
  IconTrash, 
} from "@tabler/icons-react"
import { PUBLICATION_TYPE_LABELS } from "@/lib/constants/publications"
import { Fragment } from "react/jsx-runtime"
import NextLink from 'next/link';
import classes from './ls-publications.module.css';

const ICON_SIZE = "0.85rem";

export default function LSPublication(
  { pub, isOwner }
  : 
  { pub: Publication, isOwner: boolean } 
) {
  const iconProps = { size: ICON_SIZE, color: 'var(--mantine-color-indigo-8)' };
  let typeIcon = <IconNotebook {...iconProps}/>;
  switch(pub.type) {
    case "journal_article":
      typeIcon = <IconNotebook {...iconProps}/>
      break;
    case "book_chapter":
      typeIcon = <IconBook2 {...iconProps}/>
      break;
    case "conference_paper":
      typeIcon = <IconPresentation {...iconProps}/>
      break;
    case "preprint":
      typeIcon = <IconClock {...iconProps}/>
      break;
    case "dissertation":
      typeIcon = <IconSchool {...iconProps}/>
      break;
    case "review_article":
      typeIcon = <IconBooks {...iconProps}/>
      break;
    case "technical_report":
      typeIcon = <IconClipboardText {...iconProps}/>
      break;
    default: // 'other'
      typeIcon = <IconFile {...iconProps}/>
      break;
  }
  
  const visibleAuthors = pub.authors.slice(0, 3);
  const authorOverflow = pub.authors.length - visibleAuthors.length;

  const date = pub.date_published ? 
  new Intl.DateTimeFormat("en-US", { 
    year: "numeric", 
    month: "long",  
  }).format(new Date(pub.date_published))
  : undefined;

  const doiUrl = pub.doi_link ? `https://${pub.doi_link}` : null;
  // pub.is_featured = true;
  return (
    <Card
      w='100%'
      p='0'
      bdrs='0.75rem'
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderTop: pub.is_featured ? '0px' : '1px solid var(--mantine-color-gray-3)'
      }}
    >
      {/* Is Featured? top strip */}
      { pub.is_featured && 
        <Box 
          pt='3'
          style={{
            borderRadius: '12px 12px 0 0',
            background: `
              linear-gradient(90deg, 
              var(--mantine-color-navy-7) 0%, 
              var(--mantine-color-navy-6) 50%,  
              var(--mantine-color-navy-5) 100%)`
          }}
        />
      }
      <Stack 
        bdrs='12 12 0 0' 
        p='21'
      >
        {/* Badges */}
        <Group>
          {
            pub.is_featured &&
            <Badge 
              tt='none' 
              bg='yellow.1' 
              bd='1px solid yellow.4'
              fz='0.75rem'
              fw='600'
              lh='1rem'
              c='orange.9'
              leftSection={<IconStarFilled size={ICON_SIZE} color="var(--mantine-color-yellow-7)"/>}
             >
              Featured
            </Badge>
          }
          <Badge 
            tt='none' 
            bg='indigo.0' 
            c='indigo.9' 
            fw='500'
            fz='0.75rem'
            lh='1rem'
            leftSection={typeIcon}
          >
            {PUBLICATION_TYPE_LABELS[pub.type]}
          </Badge>
          {
            pub.is_oa && 
            <Badge 
              tt='none' 
              bg='indigo.0' 
              c='indigo.9' 
              fw='500'
              fz='0.75rem'
              lh='1rem'
              leftSection={
                <IconBook {...iconProps}/>
              }
            >Open Access</Badge>
          }
          {
            pub.is_oa && pub.pdf_url ? 
            <Badge 
              tt='none' 
              bg='indigo.0' 
              c='indigo.9' 
              fw='500'
              fz='0.75rem'
              lh='1rem'
              leftSection={
                <IconPdf {...iconProps}/>
              }
            >PDF Available</Badge>
            : undefined
          }
        </Group>
        
        {/* Title */}
        <Box>
          <Anchor 
            href={doiUrl ?? ''} 
            underline={!doiUrl ? 'never' : undefined} 
            target='_blank'
            rel='noopener noreferrer'
            c='navy.7' 
            fz='lg' 
            fw='600' 
            lh='1.625rem'
          >
            {pub.title}
          </Anchor>
        </Box>
        
        <Stack gap='6'>
          {/* Avatars + Authors */}
          <Box component="span" fz='sm'>
            <Avatar.Group 
              spacing={8} 
              style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "0.5rem" }}
            >
            {
              visibleAuthors.map((name, i) => {
                const firstName = name.slice(0, name.indexOf(' '));
                const lastName = name.slice(name.lastIndexOf(' ')+1);
                const initials = `${firstName[0]}${lastName[0]}`;

                return (
                  <Avatar 
                    key={`${name}-${i}`} 
                    size="sm" 
                    color="navy.7"
                    bg='navy.7'
                  >
                    {initials}
                  </Avatar>
                );
              })
            }
            </Avatar.Group>
            {
              visibleAuthors.map((name, i) => (
                <Fragment key={`${name}-${i}`}>
                  {i > 0 && " · "}
                  {name}
                </Fragment>
              ))
            }
            {
              authorOverflow > 0 && (
                <Text component="span" c="dimmed" fz='sm'>
                  {` +${authorOverflow} more`}
                </Text>
              )
            }
          </Box>

          {/* Journal + Date */}
          <Group gap='0.5rem' fz='sm' c='dimmed'>
            {/* Using custom dot because IconDotFilled has fake padding */}
            <Box 
              component="span"
              w='0.5rem' 
              h='0.5rem' 
              bg="gray.4" 
              style={{ borderRadius: "50%", display: "inline-block" }}
            />
            {pub.journal ?? undefined}
            {pub.journal && date ? ' · ' : undefined }
            {date}
          </Group>

          {/* DOI Link */}
          {
            doiUrl ? 
            <Box>
              <Anchor 
                href={doiUrl ?? ''} 
                target='_blank'
                rel='noopener noreferrer'
                c='indigo.8' 
                size='sm'
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4}}
              >
                <IconLink color='var(--mantine-color-indigo-8)' size='var(--mantine-font-size-sm)'/>
                {pub.doi_link}
              </Anchor>
            </Box>
            : undefined
          }

          {/* Topics */}
          <Group gap='xs'>
          {
            pub.topics.map((topic) => 
              <Badge
                key={topic}
                bd={pub.is_featured ? '1px solid indigo.2' : undefined}
                bg={pub.is_featured ? 'indigo.0' : 'gray.2'}
                c={pub.is_featured ? 'indigo.9' : 'var(--mantine-color-text)'}
                fw='500'
                tt='none'
                fz='0.75rem'
              >
                {topic}
              </Badge>
            ) 
          }
          </Group>
        </Stack>

        <Divider />
        {/* View + Read PDF Buttons */}
        <Group justify='space-between'>
          <Group>
            <Button 
              bg={pub.is_featured ? 'indigo.7' : 'navy.7'} 
              bdrs='md' 
              rightSection={<IconChevronRight size='1rem'/>}
              className={pub.is_featured ? classes.featuredViewBtn : classes.viewBtn}
              component="a"
              href={doiUrl ?? ''}
              target='_blank'
              rel='noopener noreferrer'
            >
              View
            </Button>
            {
              pub.is_oa && pub.pdf_url 
              ?
              <Button 
                variant='outline'
                color={pub.is_featured ? 'indigo.7' : undefined}
                bdrs='md' 
                rightSection={<IconChevronRight size='1rem'/>}
                component="a"
                href={pub.pdf_url ?? ''}
                target='_blank'
                rel='noopener noreferrer'
              >
                Read PDF
              </Button>
              : undefined 
            }
          </Group>

          {/* Update Buttons */}
          {
            isOwner && 
            <Group gap='6'>
              <ActionIcon size='lg' variant='outline' bdrs='md'>
                <IconEdit size='1rem' />
              </ActionIcon>
              <Divider />
              <ActionIcon size='lg' bg='red.6' bdrs='md'>
                <IconTrash size='1rem' />
              </ActionIcon>
            </Group>
          }
          
          {/* <Popover withArrow position="top">
            <Popover.Target >
              <ActionIcon 
                bdrs='md'
                variant='subtle'
                color={pub.is_featured ? 'indigo.7' : undefined}
              >
                <IconDots size='1.25rem' />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown p='4'>
              <Stack gap='4'>
                <Button variant='subtle' bdrs='md' leftSection={<IconEdit size='1rem' />}>
                  Edit
                </Button>
                <Divider />
                <Button bg='red.6' bdrs='md' leftSection={<IconTrash size='1rem' />}>
                  Delete
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover> */}
        </Group>
      </Stack>
    </Card>
  )
}