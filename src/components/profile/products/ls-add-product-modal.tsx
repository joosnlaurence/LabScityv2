import { ActionIcon, Button, FileInput, Group, Modal, Select, Stack, Textarea, TextInput, Text, MultiSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import { type CreateProductValues } from "@/lib/validations/product"; 
import { useState } from "react";
import { PRODUCT_TYPE_LABELS } from "@/lib/constants/product";

export default function LSAddProductModal({ userId }: { userId: string }) {
  const [modalOpened, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [extraLinks, setExtraLinks] = useState(0);
  const [summary, setSummary] = useState('');
  const MAX_SUMMARY_LENGTH = 200;

  const handleProductSubmit = () => {};

  return (
    <>
      <Modal size='800' title='Add Research Product' centered opened={modalOpened} onClose={closeModal}>
        <Stack gap='xs' mx='5%'>
          <form onSubmit={handleProductSubmit}>
            <Stack>
              <Group align='end'>
                <TextInput flex='3' label='Product Title' placeholder='e.g. "My Cool Project"' withAsterisk/>
                <Select 
                  flex='1'
                  label='Product Type'
                  placeholder='Type'
                  data={Object.values(PRODUCT_TYPE_LABELS)}
                  comboboxProps={{ shadow: 'sm' }}
                />
              </Group>
              <Stack gap='4'>
                <Textarea 
                  label='Short Summary' 
                  withAsterisk 
                  placeholder="Write a summary about what makes your product interesting"
                  onChange={(e) => setSummary(e.currentTarget.value)}
                  autosize
                  error={summary.length > MAX_SUMMARY_LENGTH}
                  minRows={2}
                />
                <Text
                  size='xs' c={summary.length > MAX_SUMMARY_LENGTH ? 'red' : 'dimmed'} ta='right'
                >
                  {summary.length}/{MAX_SUMMARY_LENGTH}
                </Text>
              </Stack>
              <FileInput 
                w='fit-content'
                placeholder={'Upload Previews'}
                leftSection={<IconUpload size='1rem' color='var(--mantine-color-navy-7)'/>}
                styles={{
                  input: { background: 'var(--mantine-color-navy-1)' },
                  placeholder: { color: 'var(--mantine-color-primary)'}
                }}
              />
              <Group>
                <TextInput flex='1' label='Website Link' placeholder="https://..."/>
                <TextInput flex='1' label='Website Display Name' placeholder='e.g. "My Website"'/>
              </Group>
              <Group>
                <TextInput flex='1' label='GitHub Link' placeholder="https://github.com/..."/>
                <TextInput flex='1' label='GitHub Display Name' placeholder='e.g. "GitHub Repo"'/>
              </Group>
              {
                Array.from({ length: extraLinks }).map( (_, i) => 
                  <Group key={i} align='end'>
                    <TextInput flex='1' label={`Link ${i+1}`} placeholder="https://..."/>
                    <TextInput flex='1' label={`Link ${i+1} Display Name`} placeholder='e.g. "Additional Link"'/>
                    <ActionIcon size='lg' bg='red.5' onClick={() => setExtraLinks(extraLinks - 1)}>
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                )
              }
              <Button 
                variant='light'
                leftSection={<IconPlus size='1rem'/>}
                onClick={() => setExtraLinks(extraLinks + 1)}
                disabled={extraLinks >= 3}
                fw='normal'
                w='fit-content'
                bd={extraLinks >= 3 ? undefined : '1px solid gray.4'}
                bg={extraLinks >= 3 ? undefined : 'navy.1'}
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
              />
              <Group justify='end'>
                <Button onClick={closeModal}>
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