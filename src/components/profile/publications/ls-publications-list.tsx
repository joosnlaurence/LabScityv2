'use client';

import { Button, Text, Center, Collapse, Group, Loader, Stack, TextInput, LoadingOverlay, Divider, RangeSlider, Select, Menu, OptionsFilter, ComboboxItem } from "@mantine/core";
import { IconAdjustmentsHorizontal, IconList, IconListFilled, IconPlus, IconSearch, IconSelect } from "@tabler/icons-react";
import LSOrcidLinker from "./ls-orcid-link-modal";
import OrcidInfo from "./ls-orcid-info";
import LSPublication from "./ls-publication";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { useAddPubByDoi, useDeletePublication, useGetPublicationFacets, usePublications, useSetFeaturedPublication } from "./use-publications";
import { DoiFormValues, doiSchema } from "@/lib/validations/publication";
import { useForm } from "@mantine/form";
import { MAX_FEATURED_PUBLICATIONS, PUBLICATION_TYPE_LABELS } from "@/lib/constants/publications";
import { useEffect, useRef } from "react";

export default function LSPublicationsList({userId}: {userId: string}) {  
  const { user, loading: userLoading } = useAuthContext();
  const isOwner = user?.id === userId;
  
  const [doiInputExpanded, { toggle: toggleDoiInput }] = useDisclosure(false);

  const { 
    data: pubFacets, 
    isFetching: isFetchingFacets, 
    isLoading: isLoadingFacets, 
    isError: isErrorFacets
  } = useGetPublicationFacets(userId);
  const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ');
    return (options as ComboboxItem[]).filter((option) => {
      const words = option.label.toLowerCase().trim().split(' ');
      return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
    });
  };

  const {
    data: userPubs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingUserPubs,
    isError: isErrorUserPubs
  } = usePublications(userId); 
  const publications = userPubs?.pages.flatMap((p) => p.publications) ?? [];

  const { ref: scrollRef, entry } = useIntersection({
    rootMargin: "200px",
    threshold: 1
  });

  const wasIntersecting = useRef(false);
  useEffect(() => {
    const isIntersecting = entry?.isIntersecting ?? false;

    if(isIntersecting && !wasIntersecting.current && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    wasIntersecting.current = isIntersecting;
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const doiForm = useForm<DoiFormValues>({
    mode: 'uncontrolled',
    initialValues: { doi: ''},
    validate: {
      doi: (val) => {
        if(!val.trim()) return null;
        const res = doiSchema.safeParse(val);
        return res.success ? null : res.error.issues[0].message;
      }
    },
    validateInputOnBlur: true
  });

  const addPubByDoi = useAddPubByDoi({ 
    userId,
    onSuccess: () => {
      doiForm.reset();
      toggleDoiInput();
    }
  });
    
  const handleDoiSubmit = doiForm.onSubmit((vals) => {
    if (!vals.doi.trim()) return;
    addPubByDoi.mutate(vals.doi);
  });
  
  const deletePub = useDeletePublication(userId);

  const setFeaturedPub = useSetFeaturedPublication(userId);
  const featuredCount = publications?.filter((p) => p.is_featured).length ?? 0;
  
  if(isLoadingUserPubs || isLoadingFacets || userLoading) {
    return (
      <Center py='xl'>
        <Loader />
      </Center>
    )
  }

  if(isErrorUserPubs) {
    return (
      <Text ta='center' c='red' py='xl'>
        Failed to load publications...
      </Text>
    )
  }

  return (
    <Stack w='800' pos='relative'>
      <LoadingOverlay visible={addPubByDoi.isPending}/>
      {
        isOwner && 
        <Stack>
          <Group wrap='nowrap'>
            <Group flex='1' justify='right' wrap='nowrap'>
              <Collapse in={doiInputExpanded} flex='1'>
                <form onSubmit={handleDoiSubmit}>
                  <TextInput 
                    placeholder="doi.org/..." 
                    bdrs='md' 
                    disabled={addPubByDoi.isPending}
                    key={doiForm.key('doi')}
                    {...doiForm.getInputProps("doi")}
                  />
                </form>
              </Collapse>
              <Button 
                onClick={toggleDoiInput} 
                rightSection={
                  <IconPlus 
                    size='1rem'
                    style={{
                      transform: doiInputExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease',
                    }}
                  />
                }
              >
                Add Research
              </Button>
            </Group>
            <Group wrap='nowrap'>
              <LSOrcidLinker userId={userId}/>
              <OrcidInfo size='2rem' />
            </Group>
          </Group>
        </Stack>
      }
      
      {
        isErrorFacets ?
        <Text c='red' ta='center'>Failed to load user publication metadata</Text>
        :
        <Stack>
          <TextInput 
            placeholder='Search by publication title'
            styles={{
              input: {
                background: 'var(--mantine-color-gray-1)'
              }
            }}
            leftSection={<IconSearch stroke='1.75' size='1rem' color='var(--mantine-color-gray-5)'/>}
          />
          <Group justify='space-between' wrap='nowrap'>
            <Group>
              <Select
                placeholder='Year'
                data={pubFacets?.years.map(
                  (y) => ({ 
                    value: String(y.year), label: `${y.year} (${y.count})`
                  })) ?? []
                }
                w='125'
              />
              <Select 
                placeholder='Research Topic' 
                data={pubFacets?.tags.map(
                  (tag) => ({ 
                    value: String(tag.id), label: `${tag.name} (${tag.count})`
                  })) ?? []
                }
                searchable
                filter={optionsFilter}
                nothingFoundMessage='No Matching Topics...'
                w='200'
              />
              <Select 
                placeholder='Publication Type'
                data={pubFacets?.types.map(
                  (t) => ({ 
                    value: String(t.type), label: `${PUBLICATION_TYPE_LABELS[t.type]} (${t.count})`
                  })) ?? []
                }
                w='175'
              />
            </Group>
            <Select 
              w='125' 
              placeholder='Sort by' 
              data={['Newest', 'Oldest']}
              leftSection={<IconAdjustmentsHorizontal stroke='1' color='var(--mantine-color-gray-5)'/>}
            />
          </Group>
        </Stack> 
      }
      <Divider />

      <Stack>
      {
        (publications && publications.length > 0)
        ? 
        publications.map((pub, i) => 
          <LSPublication 
            key={pub.publication_id}
            pub={pub}
            isOwner={isOwner}
            onDeleteClick={() => deletePub.mutate(pub.publication_id)}
            isDeleting={deletePub.isPending && deletePub.variables === pub.publication_id}
            onFeaturedClick={() => setFeaturedPub.mutate({ 
              publicationId: pub.publication_id, 
              isFeatured: !pub.is_featured
            })}
            featureBtnDisabled={!pub.is_featured && featuredCount >= MAX_FEATURED_PUBLICATIONS}
          />
        )
        :
        <>
          No Publications found
        </>
      }
      </Stack>

      <div ref={scrollRef} style={{ height: 1 }}/>

      { isFetchingNextPage && 
        <Center py='md'>
          <Loader size='sm' />
        </Center>
      }
    </Stack>
  );
}