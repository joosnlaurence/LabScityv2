import { 
  Button, 
  Divider, 
  Group, 
  Modal, 
  TextInput,
  Text,
  Stack,
  Anchor
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import OrcidInfo from "./ls-orcid-info";
import { useForm } from "@mantine/form";
import { orcidSchema } from "@/lib/validations/publication";
import { useState } from "react";
import { ParsedOpenAlexWork } from "@/lib/types/publication";
import { OpenAlexFetchResponse } from "@/app/api/openalex/route";
import { ApiResponse } from "@/lib/types/api";
import { Publication } from "@/lib/types/data";
import LSPublication from "./ls-publication";

function workToPublication(work: ParsedOpenAlexWork): Publication {
  return {
    publication_id: -1,
    title: work.title,
    doi: work.doi,
    journal: work.journal,
    date_published: work.publicationDate,
    authors: work.authors,
    preview_path: null,
    is_oa: work.isOA,
    pdf_url: work.pdfUrl,
    type: work.type,
    is_featured: false,
    topics: [],
  };
}

export default function OrcidLinker({userId}: {userId: string}) {
  const [orcidInputOpened, { open: openOrcidInput, close: closeOrcidInput }] = useDisclosure(false);
  const [publications, setPublications] = useState<Publication[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const orcidForm = useForm({
    mode: 'uncontrolled',
    initialValues: { orcid: '' },
    validate: {
      orcid: (val) => {
        if(!val.trim()) return null;
        const res = orcidSchema.safeParse(val);
        return res.success ? null : res.error.issues[0].message;
      }
    },
    validateInputOnBlur: true,
  })

  const handleOrcidSubmit = orcidForm.onSubmit(async (vals) => {
    if (!vals.orcid.trim()) return;
    
    const normalized = orcidSchema.parse(vals.orcid);
    
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch(`/api/openalex?orcid=${normalized}`);
      const json: ApiResponse<OpenAlexFetchResponse> = await res.json();
      if(!json.success) throw new Error(json.error);
      
      console.log(json.data.works);
      setPublications(json.data.works.map((work) => workToPublication(work)))
      setStatus('idle');
    } catch (err) {
      console.error('openalex fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setStatus('error');
    }
  })

  return (
    <>
      <Modal size='800' title='Link Account With ORCID iD' centered opened={orcidInputOpened} onClose={closeOrcidInput}>
        <Stack gap='sm'>
          <Stack gap='xs'>
            <form onSubmit={handleOrcidSubmit} style={{flex: 1}}>
              <Group>
                  <TextInput 
                    flex='1' 
                    placeholder="https://orcid.org/0000-0001-2345-6789"
                    key={orcidForm.key("orcid")}
                    {...orcidForm.getInputProps("orcid")}
                    disabled={status === 'loading'}
                  />
                <Button type='submit' disabled={status === 'loading'}>
                  Link
                </Button>
              </Group>
            </form>
            <Group justify='flex-end' gap='4'>
              <Anchor underline='always' w='fit-content' href='https://info.orcid.org/what-is-my-id/' size='sm'>
                Get your iD
              </Anchor>
              <OrcidInfo size='1.5rem' />
            </Group>
          </Stack>
          <Divider />
          {
            !publications ?
            <Text ta='center' size='sm' c='dimmed' py='100'>
              Once you link your account with your ORCID iD, your publications will appear here
            </Text>
            : publications.length === 0 ?
              <Text ta='center' size='sm' c='dimmed' py='100'>
                No publications found for this ORCID iD. Are you sure it is correct?
              </Text>
              : <Stack>
                
                {
                  publications.map((pub) => 
                  <LSPublication key={pub.doi} pub={pub} isOwner={false}/>)
                }
                </Stack>
          }
        </Stack>
      </Modal>
      <Button variant='outline' onClick={openOrcidInput}>
        Link With ORCID iD
      </Button>
    </>
  );
}