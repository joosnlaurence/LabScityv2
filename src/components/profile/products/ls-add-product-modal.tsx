import { ActionIcon, Button, FileInput, Group, Modal, Select, Stack, Textarea, TextInput, Text, MultiSelect, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import { createProductSchema, type CreateProductValues } from "@/lib/validations/product"; 
import { useState } from "react";
import { PRODUCT_TYPE_LABELS } from "@/lib/constants/product";
import { useCreateProduct } from "./use-products";

const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function LSAddProductModal({ userId }: { userId: string }) {
  const [modalOpened, {open: openModal, close: closeModal}] = useDisclosure(false);
  
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
      product_type: undefined,
      tag_ids: [],
    }
  });
  const summary = form.getValues().short_summary ?? '';
  const MAX_SUMMARY_LENGTH = 300;
  
  const createProduct = useCreateProduct({userId, onSuccess: closeModal});

  const handleProductSubmit = form.onSubmit((product) => {
    product = {
      ...product,
      links: product.links?.filter((l) => l.url.trim() !== "")
    }
    const parsed = createProductSchema.safeParse(product);
    if(!parsed.success) {
      parsed.error.issues.forEach((issue) => 
        form.setFieldError(issue.path.join("."), issue.message)
      );
      return;
    }
    createProduct.mutate(parsed.data);
  })
  
  const addLinksBtnDisabled = (form.getValues().links?.slice(2).length ?? 0) >= 3;

  return (
    <>
      <Modal size='800' title='Add Research Product' centered opened={modalOpened} onClose={closeModal}>
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
                  error={summary.length > MAX_SUMMARY_LENGTH}
                  minRows={2}
                  key={form.key('short_summary')}
                  {...form.getInputProps('short_summary')}
                />
                <Text
                  size='xs' c={summary.length > MAX_SUMMARY_LENGTH ? 'red' : 'dimmed'} ta='right'
                >
                  {summary.length}/{MAX_SUMMARY_LENGTH}
                </Text>
              </Stack>
              <Group>
                <Stack gap='4' align='center'>
                  <Tooltip label='Add screenshots or photos of your product'>
                    <FileInput 
                      w='160'
                      placeholder={'Upload Previews'}
                      leftSection={<IconUpload size='1rem' color='var(--mantine-color-navy-7)'/>}
                      styles={{
                        input: { background: 'var(--mantine-color-navy-1)' },
                        placeholder: { color: 'var(--mantine-color-primary)'}
                      }}
                      multiple
                      accept={ACCEPTED_FILE_TYPES}
                    />
                  </Tooltip>
                  <Text fz='xs' c='dimmed' ta='center' w='160'>
                    JPG, PNG, or WebP · up to 5MB each
                  </Text>
                </Stack>
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
              <MultiSelect 
                label='Topics'
                placeholder='Research Topics'
                data={[
                  "Insect-Plant Interactions and Control",
                  "Insect Symbiosis and Bacterial Influences",
                  "Microbial Community Ecology and Function",
                  "CRISPR Gene Editing and Applications",
                  "Protein Structure Prediction and Folding",
                  "Machine Learning in Bioinformatics",
                  "Coral Reef Ecology and Conservation",
                  "Soil Microbiome and Nutrient Cycling",
                  "Neural Mechanisms of Memory and Learning",
                  "Antimicrobial Resistance in Bacteria",
                ]}
                comboboxProps={{ shadow: 'sm' }}
                searchable
                styles={{
                  pill: {
                    background: 'var(--mantine-color-gray-2)',
                    color: 'var(--mantine-color-primary)'
                  }
                }}
                // {...form.getInputProps('tag_ids')}
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