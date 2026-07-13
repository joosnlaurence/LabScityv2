import { ActionIcon, Button, Image, FileInput, Group, Modal, Select, Stack, Textarea, TextInput, Text, MultiSelect, Tooltip, FileButton, Card, Box } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm, isNotEmpty } from "@mantine/form";
import { IconBox, IconPlus, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { createProductSchema, type CreateProductValues } from "@/lib/validations/product"; 
import { useState } from "react";
import { MAX_IMAGE_UPLOADS as MAX_PRODUCT_PREVIEWS, MAX_PRODUCT_SUMMARY_LENGTH, PRODUCT_TYPE_LABELS } from "@/lib/constants/product";
import { useCreateProduct, useSearchTags } from "./use-products";
import { UploadProductPreview } from "@/lib/types/data";

const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function LSAddProductModal({ userId }: { userId: string }) {
  const [modalOpened, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [images, setImages] = useState<UploadProductPreview[]>([]);

  const [tagsSearch, setTagsSearch] = useState('');
  const [debouncedTagsSearch] = useDebouncedValue(tagsSearch, 300);
  const searchTags = useSearchTags(debouncedTagsSearch);

  const form = useForm<CreateProductValues>({
    mode: 'controlled',
    initialValues: {
      title: "",
      short_summary: "",
      links: [
        { kind: 'website', url: '', label: ''},
        { kind: 'github', url: '', label: ''},
      ],
      contributors: [],
      product_type: 'other',
      tag_ids: [],
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Title is required'),
      short_summary: (v) => 
        v.trim().length === 0 ? 'Short summary is required'
        : v.length > MAX_PRODUCT_SUMMARY_LENGTH ? ' ' 
        : null
    },
  });
  const summary = form.getValues().short_summary ?? '';
    
  
  const createProduct = useCreateProduct({
    userId, 
    onSuccess: () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
      setImages([]);
      form.reset();
      closeModal();
    }
  });

  const handleProductSubmit = form.onSubmit((product) => {
    product = {
      ...product,
      product_type: product.product_type ?? 'other',
      links: product.links?.filter((l) => l.url.trim() !== "")
        .map((link) => ({
          ...link,
          url: /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`,
          label: link.label?.trim() || null
        })),
      tag_ids: product.tag_ids?.map(Number)
    }
    const parsed = createProductSchema.safeParse(product);
    if(!parsed.success) {
      parsed.error.issues.forEach((issue) => 
        form.setFieldError(issue.path.join("."), issue.message)
      );
      return;
    }
    createProduct.mutate({
      product: parsed.data, images: images.map((img) => (
        { file: img.file, width: img.width, height: img.height }
      ))
    });
  })
  
  const addLinksBtnDisabled = (form.getValues().links?.slice(2).length ?? 0) >= 3;

  const onAddImage = (payload: File[] | null) => {
    if (!payload) return;
    const remaining = Math.max(MAX_PRODUCT_PREVIEWS - images.length, 0);
    payload.slice(0, remaining).forEach((file) => {
      const url = URL.createObjectURL(file);
      const probe = new window.Image();
      probe.onload = () => {
        setImages((prev) => [
          ...prev,
          { file, url, width: probe.naturalWidth, height: probe.naturalHeight },
        ]);
      };
      probe.src = url;
    });
  };
  const onRemoveImage = (imgUrl: string) => {
    URL.revokeObjectURL(imgUrl);
    setImages((prev) => prev.filter(({url}) => url !== imgUrl))
  }
  const uploadPreviewsBtnDisabled = images.length >= MAX_PRODUCT_PREVIEWS;

  return (
    <>
      <Modal size='800' title={
        <Group>
          <Box bg='navy.3' bdrs='md' p='8'>
            <IconBox />
          </Box>
          <Stack gap='0'>
            <Text fw='700'>Add a Research Product</Text>
            <Text fz='xs' c='dimmed'>Share a dataset, tool, or other research output</Text>
          </Stack>
        </Group>
      } centered opened={modalOpened} onClose={closeModal}>
        <Stack gap='xs' mx='5%'>
          <form 
            onSubmit={handleProductSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
          >
            <Stack>
              <Group align='end'>
                <TextInput 
                  flex='3' 
                  label='Product Title' 
                  placeholder='e.g. "My Cool Project"' 
                  withAsterisk
                  key={form.key('title')}
                  {...form.getInputProps('title')}
                />
                <Select 
                  flex='1'
                  label='Product Type'
                  placeholder='Type'
                  data={Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({value, label}))}
                  comboboxProps={{ shadow: 'sm' }}
                  key={form.key('product_type')}
                  {...form.getInputProps('product_type')}
                />
              </Group>
              <Stack gap='4'>
                <Textarea 
                  label='Short Summary' 
                  withAsterisk 
                  placeholder="Write a summary about what makes your product interesting"
                  autosize
                  error={summary.length > MAX_PRODUCT_SUMMARY_LENGTH}
                  minRows={2}
                  
                  key={form.key('short_summary')}
                  {...form.getInputProps('short_summary')}
                />
                <Text
                  size='xs' c={summary.length > MAX_PRODUCT_SUMMARY_LENGTH ? 'red' : 'dimmed'} ta='right'
                >
                  {summary.length}/{MAX_PRODUCT_SUMMARY_LENGTH}
                </Text>
              </Stack>
              <Group w='100%' wrap='nowrap' justify='space-between'>
                <Stack gap='4' align='center'>
                  <Tooltip label='Add screenshots or photos of your product'>
                    <FileButton disabled={images.length >= MAX_PRODUCT_PREVIEWS} onChange={onAddImage} accept={ACCEPTED_FILE_TYPES} multiple>
                      {(props) =>
                        <Button
                          {...props}
                          w='fit-content'
                          leftSection={
                            <IconUpload 
                              size='1rem' 
                              color={uploadPreviewsBtnDisabled ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-navy-7)'}
                            />}
                          bg={uploadPreviewsBtnDisabled ? 'gray.2' : 'navy.1'}
                          c={uploadPreviewsBtnDisabled ? 'gray.5' : 'navy.7'}
                          bd={uploadPreviewsBtnDisabled ? undefined :'1px solid gray.4'}
                          fw='normal'
                          disabled={uploadPreviewsBtnDisabled}
                        > 
                          Upload Previews
                        </Button>
                      }
                    </FileButton>
                  </Tooltip>
                  <Stack gap='0'>
                    <Text fz='xs' c='dimmed' ta='center' w='160'>
                      JPG, PNG, or WebP 
                    </Text>
                    <Text fz='xs' c='dimmed' ta='center' w='160'>
                      Up to 5MB each
                    </Text>
                  </Stack>
                </Stack>
                {
                  images.map(({ url }) => 
                    <Box key={url} pos='relative' h='80' w='80'>
                      <ActionIcon 
                        pos='absolute'
                        top={-6}
                        right={-6}
                        size='xs'
                        radius='xl'
                        variant='filled'
                        onClick={() => onRemoveImage(url)}
                      >
                        <IconX size='14'/>
                      </ActionIcon>
                      <Image src={url} h='80' w='80'bdrs='md' bd='2px solid gray.4' fit='cover'/>
                    </Box>
                  )
                }
                {
                  Array.from({ length: MAX_PRODUCT_PREVIEWS - images.length}).map((_, i) =>
                    <Box key={i} h='80' w='80' bdrs='md' bd='2px dashed gray.4'/>
                  ) 
                }
              </Group>
              <Group>
                <TextInput flex='1' label='Website Link' placeholder="https://..." 
                  {...form.getInputProps('links.0.url')}/>
                <TextInput flex='1' label='Website Display Name' placeholder='e.g. "My Website"'
                  {...form.getInputProps('links.0.label')} />
              </Group>
              <Group>
                <TextInput flex='1' label='GitHub Link' placeholder="https://github.com/..."
                  {...form.getInputProps('links.1.url')}/>
                <TextInput flex='1' label='GitHub Display Name' placeholder='e.g. "GitHub Repo"'
                  {...form.getInputProps('links.1.label')}/>
              </Group>
              {
                form.getValues().links?.slice(2).map( (_, i) => 
                  <Group key={i} align='end'>
                    <TextInput flex='1' label={`Link ${i+1}`} placeholder="https://..."
                      {...form.getInputProps(`links.${i+2}.url`)}/>
                    <TextInput flex='1' label={`Link ${i+1} Display Name`} placeholder='e.g. "Additional Link"'
                      {...form.getInputProps(`links.${i+2}.label`)}/>
                    <ActionIcon 
                      size='lg' 
                      bg='red.5' 
                      onClick={() => form.removeListItem("links", i+2)}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                )
              }
              <Button 
                variant='light'
                leftSection={<IconPlus size='1rem'/>}
                onClick={() => form.insertListItem("links", { kind: 'other', url: '', label: '' })}
                disabled={addLinksBtnDisabled}
                fw='normal'
                w='fit-content'
                bd={addLinksBtnDisabled ? undefined : '1px solid gray.4'}
                bg={addLinksBtnDisabled ? undefined : 'navy.1'}
              >
                Add Additional Link
              </Button>
              {/* TODO: Figure out how to wire infinite scrolling in the MultiSelect */}
              <MultiSelect 
                label='Topics'
                placeholder='Research Topics'
                data={searchTags.data?.map(t => ({ value: String(t.id), label: t.name }))}
                comboboxProps={{ shadow: 'sm' }}
                searchable
                styles={{
                  pill: {
                    background: 'var(--mantine-color-gray-2)',
                    color: 'var(--mantine-color-primary)'
                  }
                }}
                searchValue={tagsSearch}
                onSearchChange={setTagsSearch}
                nothingFoundMessage={'No matching topics found...'}
                {...form.getInputProps('tag_ids')}
              />
              <Group justify='end'>
                <Button 
                  type='submit' 
                  loading={createProduct.isPending}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Modal>
      <Button 
        leftSection={ <IconPlus size='1rem'/> }
        onClick={openModal}
      >
        Add Product
      </Button>  
    </>
  )
}