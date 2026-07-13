import { 
  ActionIcon,
  Anchor,
  Badge, 
  Box, 
  Button, 
  Card, 
  Divider, 
  Group, 
  Menu, 
  Modal, 
  Stack, 
  Text,
  Tooltip,
  Image
} from "@mantine/core"
import { Carousel } from "@mantine/carousel"
import NextImage from "next/image";
import { 
  IconBookmark,
  IconBrandGithub,
  IconDots, 
  IconEdit, 
  IconExternalLink, 
  IconLink,  
  IconPin, 
  IconPinFilled, 
  IconStarFilled,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react"
// import NextLink from 'next/link';
import { useDisclosure } from "@mantine/hooks";
import { Product } from "@/lib/types/data";
import { MAX_FEATURED_PRODUCTS } from "@/lib/constants/product";
import classes from './ls-product.module.css';
import { OPENALEX_WORK_TYPE_LABELS, PUB_PRODUCT_TYPE_ICONS } from "@/lib/constants/openalex";

const visibleAuthors = ['Barbara J. Sharanowski', 'Jason Laureano', 'Bob Christ']
const authorOverflow = 0;

export default function LSProduct(
  { 
    product, 
    isOwner, 
    onDeleteClick, 
    isDeleting, 
    onFeaturedClick,
    featureBtnDisabled,
    onSaveClick,
  }
  : 
  { 
    product: Product, 
    isOwner: boolean, 
    onDeleteClick?: () => void, 
    isDeleting?: boolean,
    onFeaturedClick?: () => void,
    featureBtnDisabled?: boolean,
    onSaveClick?: () => void,
  } 
)  {
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const typeIcon = PUB_PRODUCT_TYPE_ICONS[product.product_type ?? 'other'];
  const websiteLink = product.links.find((link) => link.kind === 'website');
  const githubLink = product.links.find((link) => link.kind === 'github');
  const otherLinks = product.links.filter((link) => link.kind === 'other');
  const viewLink = websiteLink?.url ?? githubLink?.url ?? null;


  return (
    <>
    {
      isOwner &&
      <Modal
        opened={confirmOpen}
        onClose={closeConfirm}
        title="Delete product"
        centered
        closeOnClickOutside={!isDeleting}
        closeOnEscape={!isDeleting}
        withCloseButton={!isDeleting}
      >
        <Text size="sm" mb="md">
          Remove <b>{product.title}</b> from your profile? This can't be undone.
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" onClick={closeConfirm} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={onDeleteClick} disabled={isDeleting} loading={isDeleting}>
            Delete
          </Button>
        </Group>
      </Modal>
    }
    <Card
      w='100%'
      p='0'
      bdrs='0.75rem'
      style={{
        border: product.is_featured ? '1px solid var(--mantine-color-blue-3)'  : '1px solid var(--mantine-color-gray-3)',
        borderTop: product.is_featured ? '1px solid var(--mantine-color-blue-3)' : '1px solid var(--mantine-color-gray-3)',
      }}
      shadow={product.is_featured ? '0 2px 12px 0 rgba(37, 99, 235, 0.08)' : 'xs'}
      bg={product.is_featured ? '#F8FBFF' : undefined}
    >
      {/* Is Featured? top strip */}
      { product.is_featured && 
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
      {
        product.images.length > 0 &&
        <Carousel withIndicators height={140} emblaOptions={{ watchDrag: false, loop: true }} classNames={classes}>
          {
            product.images.map((img) =>
              <Carousel.Slide key={img.url} pos='relative'>
                <Image 
                  component={NextImage}
                  src={img.url}
                  fit='contain'
                  fill
                  alt=''
                />
              </Carousel.Slide>
            )
          }
        </Carousel>
      }
      <Stack 
        bdrs='12 12 0 0' 
        p='21'
      >
        {/* Badges + Pin Icon */}
        <Group justify="space-between" wrap='nowrap'>
          {/* Badges */}
          <Group>
            {
              product.is_featured &&
              <Badge 
                tt='none' 
                bg='yellow.1' 
                bd='1px solid yellow.4'
                fz='0.75rem'
                fw='600'
                lh='1rem'
                c='orange.9'
                leftSection={<IconStarFilled size='0.85rem' color="var(--mantine-color-yellow-7)"/>}
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
              {OPENALEX_WORK_TYPE_LABELS[product.product_type ?? 'other']}
            </Badge>
          </Group>

          {/* Make Featured */}
          {
            (isOwner && !!onFeaturedClick) &&
            <Tooltip label={`You can feature up to ${MAX_FEATURED_PRODUCTS} products`} disabled={!featureBtnDisabled}> 
              <ActionIcon variant="subtle" onClick={onFeaturedClick} disabled={featureBtnDisabled}>
                {
                  product.is_featured ?
                  <IconPinFilled stroke='1.25' color='var(--mantine-color-yellow-7)'/>
                  :
                  <IconPin stroke='1.25'/>
                }
              </ActionIcon>
            </Tooltip>
          }
        </Group>
        
        <Stack gap='6'>
          {/* Title */}
          <Text 
            fz='lg' 
            fw='600' 
            lh='1rem'
          >
            {product.title}
          </Text>
          {/* Contributors */}
          <Group fz='sm'>
            {
              product.contributors ?
              <Text c='dimmed' fz='sm'>
                {product.contributors.map((name, i) => (
                  `${i > 0 ? " · " : ''} ${name} ${i === visibleAuthors.length-1 ? " " : ''}`
                ))}
              </Text>
              : undefined
            }
            {
              // authorOverflow > 0 && (
              //   <Popover shadow='xs'>
              //     <Popover.Target>
              //       <UnstyledButton className={classes.authorOverflow} component="span" c="dimmed" fz='sm'>
              //         {`+${authorOverflow} more`}
              //       </UnstyledButton>
              //     </Popover.Target>
              //     <Popover.Dropdown
              //       bdrs='md' 
              //       bd='1px solid navy.2'
              //     >
              //       <Stack gap='2'>
              //         {
              //           (product.authors ?? []).map((name, i) => 
              //             <Text key={`${product.publication_id}-${name}-${i}`} size='sm'>{name}</Text>
              //           )
              //         }
              //       </Stack>
              //     </Popover.Dropdown>
              //   </Popover>
              // )
            }
          </Group>
          
          {/* Product Summary */}
          <Text fz='sm'>
            {product.short_summary}
          </Text>

          {/* Links */}
          <Group>
            {
              websiteLink ? 
              <Anchor
                href={websiteLink.url}
              >
                <Group align="center" gap='4'>
                  <IconWorld color='var(--mantine-color-indigo-5)' size='1rem'/>
                  <Text component='span' c='indigo.5' fz='xs'>
                    {websiteLink.label ?? new URL(websiteLink.url).hostname}  
                  </Text> 
                </Group>
              </Anchor> 
              : undefined
            }
            {
              githubLink ? 
              <Anchor
                href={githubLink.url}
              >
                <Group align="center" gap='4'>
                  <IconBrandGithub size='1rem'/>
                  <Text component='span' fz='xs'>
                    {githubLink.label}  
                  </Text> 
                </Group>
              </Anchor> 
              : undefined
            }
            {
              otherLinks.map((link, i) => 
                <Anchor
                  href={link.url}
                  key={`${link.url}-${i}`}
                >
                  <Group align="center" gap='4'>
                    <IconLink size='1rem'/>
                    <Text component='span' fz='xs'>
                      {link.label}  
                    </Text> 
                  </Group>
                </Anchor> 
              )
            }
          </Group>

          {/* Topics */}
          {
            (product?.topics && product.topics.length > 0) ?
            <Group gap='xs' py='6'>
              {
              product.topics.map((topic) =>  
                <Badge
                  key={topic}
                  bd={product.is_featured ? '1px solid indigo.2' : undefined}
                  bg={product.is_featured ? 'indigo.0' : 'gray.2'}
                  c={product.is_featured ? 'indigo.9' : 'var(--mantine-color-text)'}
                  fw='500'
                  tt='none'
                  fz='0.75rem'
                >
                  {topic}
                </Badge>
                )
              }
            </Group>
            : undefined
          }
        </Stack>

        <Divider />
        {/* View Button */}
        <Group justify='space-between'>
          <Group>
            {
              !!viewLink &&
              <Button 
                bg={product.is_featured ? 'indigo.7' : 'navy.7'} 
                bdrs='md' 
                leftSection={<IconExternalLink size='1rem'/>}
                className={product.is_featured ? classes.featuredViewBtn : classes.viewBtn}
                component="a"
                target='_blank'
                rel='noopener noreferrer'
                href={viewLink}
              >
                View
              </Button>
            }
          </Group>

          <Group>
            {
              !!onSaveClick &&
              <ActionIcon variant='subtle' size='lg' onClick={onSaveClick}>
                <IconBookmark size='1.25rem' stroke='1.5' fill={product.isSaved ? 'currentColor' : 'none'}/>
              </ActionIcon>
            }
            {/* Update Buttons */}
            {
              isOwner &&             
              <Menu position="top-end" shadow="md">
                <Menu.Target>
                  <ActionIcon variant='subtle' size='lg'>
                    <IconDots size='1.25rem' color='var(--mantine-color-navy-7)' />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size='1rem' />}>
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size='1rem' />}
                    onClick={openConfirm}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            }
          </Group>
        </Group>
      </Stack>
    </Card>
    </>
  )
}