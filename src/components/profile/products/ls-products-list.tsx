'use client';

import { Button, Text, Center, Collapse, Group, Loader, Stack, TextInput, LoadingOverlay, Divider, RangeSlider, Select, Menu, OptionsFilter, ComboboxItem, Modal } from "@mantine/core";
import { IconAdjustmentsHorizontal, IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useDebouncedValue, useDisclosure, useIntersection } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import { ProductFilters } from "@/lib/types/products";
import { sampleProducts } from "./products-data";
import LSProduct from "./ls-product";
import LSAddProductModal from "./ls-add-product-modal";
import { useDeleteProduct, useProducts, useSetFeaturedProduct } from "./use-products";
import { MAX_FEATURED_PRODUCTS } from "@/lib/constants/product";

export default function LSPublicationsList({userId}: {userId: string}) {  
  const { user, loading: userLoading } = useAuthContext();
  const isOwner = user?.id === userId;
  

  // const { 
  //   data: prodFacets, 
  //   isLoading: isLoadingFacets, 
  //   isError: isErrorFacets
  // } = useGetProductsFactets(userId);
  // const optionsFilter: OptionsFilter = ({ options, search }) => {
  //   const splittedSearch = search.toLowerCase().trim().split(' ');
  //   return (options as ComboboxItem[]).filter((option) => {
  //     const words = option.label.toLowerCase().trim().split(' ');
  //     return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
  //   });
  // };

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    tagId: null,
    type: null,
    sort: 'newest'
  });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedInput] = useDebouncedValue(searchInput, 300);

  const activeFilters: ProductFilters = { ...filters, search: debouncedInput.trim() };

  const {
    data: userProducts,
    // fetchNextPage,
    // hasNextPage,
    // isFetchingNextPage,
    isLoading: isLoadingUserPubs,
    isError: isErrorUserPubs,
    isFetching: isFetchingPubs
  } = useProducts(userId); 
  const products = userProducts ?? [];
  // const products = userProducts?.pages.flatMap((p) => p.products) ?? [];

  // const { ref: scrollRef, entry } = useIntersection({
  //   rootMargin: "200px",
  //   threshold: 1
  // });

  // const wasIntersecting = useRef(false);
  // useEffect(() => {
  //   const isIntersecting = entry?.isIntersecting ?? false;

  //   if(isIntersecting && !wasIntersecting.current && hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }

  //   wasIntersecting.current = isIntersecting;
  // }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const deleteProduct = useDeleteProduct(userId);

  const setFeaturedProduct = useSetFeaturedProduct(userId);
  const featuredCount = products?.filter((p) => p.is_featured).length ?? 0;
  
  if(isLoadingUserPubs || userLoading) {
  // if(isLoadingUserPubs || isLoadingFacets || userLoading) {
    return (
      <Center py='xl'>
        <Loader />
      </Center>
    )
  }

  if(isErrorUserPubs) {
    return (
      <Text ta='center' c='red' py='xl'>
        Failed to load products...
      </Text>
    )
  }

  return (
    <Stack w='800'>
      <Group justify='space-between'>
        <Stack gap='0'>
          <Text fw='bold'>Products</Text>
          <Text size='xs' c='dimmed'>{products.length} research products {isOwner ? ' on your profile' : `from Bob Bobberson`}</Text>
        </Stack>
        {
          isOwner && 
          <LSAddProductModal userId={userId} />
        }
      </Group>
      
      {
        // isErrorFacets ?
        false ?
        <Text c='red' ta='center'>Failed to load user research products metadata</Text>
        :
        <Stack>
          <TextInput 
            placeholder='Search research products...'
            styles={{ input: { background: 'var(--mantine-color-gray-1)' } }}
            leftSection={<IconSearch stroke='1.75' size='1rem' color='var(--mantine-color-gray-5)'/>}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
          />
          <Group justify='space-between' wrap='nowrap'>
            <Group>
              <Select 
                placeholder='Research Topic' 
                // data={pubFacets?.tags.map(
                //   (tag) => ({ 
                //     value: String(tag.id), label: `${tag.name} (${tag.count})`
                //   })) ?? []
                // }
                clearable
                searchable
                // filter={optionsFilter}
                nothingFoundMessage='No Matching Topics...'
                onChange={(t) => setFilters((prev) => ({ ...prev, tagId: t }))}
                w='200'
              />
              <Select 
                placeholder='Type'
                // data={pubFacets?.types.map(
                //   (t) => ({ 
                //     value: String(t.type), label: `${PUBLICATION_TYPE_LABELS[t.type]} (${t.count})`
                //   })) ?? []
                // }
                clearable
                onChange={(type) => setFilters((prev) => ({ ...prev, type }))}
                w='175'
              />
            </Group>
            <Select 
              w='125' 
              placeholder='Sort by' 
              data={[
                {value: 'newest', label: 'Newest'}, 
                {value: 'oldest', label: 'Oldest'}
              ]}
              allowDeselect={false}
              onChange={(sort) => setFilters((prev) => ({ ...prev, sort: (sort as 'newest' | 'oldest') ?? 'newest' }))}
              defaultValue='newest'
              leftSection={<IconAdjustmentsHorizontal stroke='1' color='var(--mantine-color-gray-5)'/>}
            />
          </Group>
        </Stack> 
      }
      <Divider />

      <Stack pos='relative'>
        {/* {
          (addPubByDoi.isPending || (isFetchingPubs && !isFetchingNextPage)) &&
          <Loader mx='auto' />
        } */}
        {/* <LoadingOverlay
          visible={addPubByDoi.isPending || (isFetchingPubs && !isFetchingNextPage)}
          loaderProps={{ children: '' }}
        /> */}
      </Stack>

      {/* <div ref={scrollRef} style={{ height: 1 }}/> */}

      {
        products.length > 0 &&
        <Stack>
          {
            products.map((p) => 
              <LSProduct 
                key={p.product_id} 
                product={p} 
                isOwner={isOwner}
                onDeleteClick={() => deleteProduct.mutate(p.product_id)}
                isDeleting={deleteProduct.isPending}
                onFeaturedClick={() => setFeaturedProduct.mutate({productId: p.product_id, isFeatured: !p.is_featured})}
                featureBtnDisabled={featuredCount >= MAX_FEATURED_PRODUCTS}
              />
            )
          }
        </Stack>
      }

      {/* { isFetchingNextPage && 
        <Center py='md'>
          <Loader size='sm' />
        </Center>
      } */}
    </Stack>
  );
}