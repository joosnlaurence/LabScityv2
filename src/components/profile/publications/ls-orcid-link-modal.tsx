import { 
  Button, 
  Divider, 
  Group, 
  Modal, 
  TextInput,
  Text,
  Stack,
  Anchor,
  Center,
  Loader,
  Pagination,
  SimpleGrid,
  Checkbox,
  Chip
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import OrcidInfo from "./ls-orcid-info";
import { useForm } from "@mantine/form";
import { orcidSchema } from "@/lib/validations/publication";
import { useEffect, useMemo, useState } from "react";
import { ParsedOpenAlexWork } from "@/lib/types/publication";
import { ApiResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import LSPublicationReviewItem from "./ls-publication-review-item";
import { PUBLICATION_TYPE_LABELS } from "@/lib/constants/publications";
import { useBulkInsertPublications } from "./use-publications";

export default function LSOrcidLinker({userId}: {userId: string}) {
  const [orcidInputOpened, { open: openOrcidInput, close: closeOrcidInput }] = useDisclosure(false);
  const [orcid, setOrcid] = useState<string | null>(null);
  const [activePage, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
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

  function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) {
      return [];
    }
    const head = array.slice(0, size);
    const tail = array.slice(size);
    return [head, ...chunk(tail, size)];
  }  

  const { data: publications, isFetching, isError, error } = 
    useQuery({
      queryKey: ["openalex", orcid],
      queryFn: async () => {
        const res = await fetch(`/api/openalex?orcid=${orcid}`);
        const json: ApiResponse<ParsedOpenAlexWork[]> = await res.json();
        if(!json.success) throw new Error(json.error);
        return json.data;
      },
      enabled: !!orcid,
    });

  useEffect(() => {
    if(publications) {
      setSelected(new Set(publications.map((p) => p.doi!)))
    }
  }, [publications])

  const handleOrcidSubmit = orcidForm.onSubmit(async (vals) => {
    if(!vals.orcid.trim()) return;
    setOrcid(orcidSchema.parse(vals.orcid));
    setPage(1);
  })

  const bulkInsertPublications = useBulkInsertPublications(userId);

  const handleImportPublications = () => {
    bulkInsertPublications.mutate(
      publications!.filter((w) => selected.has(w.doi!))
    )
  };

  const chunkedPubs = publications ? chunk(publications, 20) : [];

  const toggleSelected = (doi: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(doi);
      } else {
        next.delete(doi);
      }
      return next;
    });
  };

  const allChecked = 
    !!publications && publications.length > 0 && selected.size === publications.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleSelectAll = (checked: boolean) => {
    setSelected(checked && publications 
      ? 
      new Set(publications.map((pub) => pub.doi!))
      : 
      new Set()
    );
  }

  type PubType = keyof typeof PUBLICATION_TYPE_LABELS;

  const groups = useMemo(() => {
    const m = new Map<PubType, string[]>();
    for(const pub of publications ?? []) {
      const key = pub.type ?? 'other'
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(pub?.doi ?? '');
    }
    return m;
  }, [publications])

  const toggleGroup = (key: PubType) => {
    const dois = groups.get(key);
    const allOn = dois?.every((d) => selected.has(d));
    setSelected((prev) => {
      const next = new Set(prev);
      dois!.forEach((d) => (allOn ? next.delete(d) : next.add(d)));
      return next;
    });
  }

  const PUB_TYPE_ORDER = Object.keys(PUBLICATION_TYPE_LABELS) as PubType[];

  console.log(publications);

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
                  disabled={isFetching || bulkInsertPublications.isPending}
                />
                <Button type='submit' disabled={isFetching || bulkInsertPublications.isPending}>
                  Find Publications
                </Button>
              </Group>
            </form>
            {
              !!publications &&
              <Button onClick={handleImportPublications} disabled={bulkInsertPublications.isPending}>
                Import
              </Button>
            }
            <Group justify='flex-end' gap='4'>
              <Anchor c='navy.6' underline='always' w='fit-content' href='https://info.orcid.org/what-is-my-id/' size='sm'>
                Get your iD
              </Anchor>
              <OrcidInfo size='1.5rem' />
            </Group>
          </Stack>
          <Divider />
          { 
            isFetching ? 
            
            <Center py='100'>
              <Loader />
            </Center>
            
            : isError ?
            
            <Text ta='center' size='sm' c='red' py='100'>
              {error instanceof Error ? error.message : "Failed to fetch publications"}
            </Text> 
            
            : !publications ?
            
            <Text ta='center' size='sm' c='dimmed' py='100'>
              Once you link your account with your ORCID iD, your publications will appear here
            </Text>
            
            : publications.length === 0 ?
            
            <Text ta='center' size='sm' c='dimmed' py='100'>
              No publications found for this ORCID iD. Are you sure it is correct?
            </Text>
            
            : 
            
            <Stack>
              <Text size="sm" c="dimmed">
                {publications.length} publications found ·{" "}
                <Text span c="navy.7">
                  {selected.size} selected
                </Text>
              </Text>
              <Checkbox 
                checked={allChecked} 
                indeterminate={someChecked} 
                label='Select all'
                onChange={(e) => toggleSelectAll(e.currentTarget.checked)}
                color='navy.6'
              />
              <Chip.Group multiple>
                <Group gap='4'>
                {
                  [...groups]
                  .sort((a, b) => PUB_TYPE_ORDER.indexOf(a[0]) - PUB_TYPE_ORDER.indexOf(b[0]))
                  .map(([type, dois]) => {
                    const selectedInGroup = dois.filter((d) => selected.has(d)).length
                    const allOfGroup = selectedInGroup === dois.length;
                    const someOfGroup = selectedInGroup > 0 && !allOfGroup;

                    return (
                      <Chip 
                        key={type}
                        checked={allOfGroup}
                        onChange={() => toggleGroup(type)}
                        color='navy.6'
                        size='xs'
                      >
                        {PUBLICATION_TYPE_LABELS[type]} ({selectedInGroup}/{dois.length})
                      </Chip>
                    )
                  })
                }
                </Group>
              </Chip.Group>
              <Pagination total={chunkedPubs!.length} value={activePage} onChange={setPage}/>
              <SimpleGrid cols={2}>
              {
                chunkedPubs[activePage - 1]?.map((pub) => 
                  <LSPublicationReviewItem 
                    key={pub.doi} 
                    pub={pub} 
                    selected={selected.has(pub.doi!)} 
                    onSelectChange={(checked) => toggleSelected(pub.doi!, checked)}
                  />
                )
              }
              </SimpleGrid>
              <Pagination total={chunkedPubs!.length} value={activePage} onChange={setPage}/>
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