'use client';

import { Text, Center, Group, Loader, Stack, TextInput, Divider, Select, OptionsFilter, ComboboxItem } from "@mantine/core";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useDebouncedValue, useIntersection } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { ProductFilters } from "@/lib/types/products";
import LSProduct from "./ls-product";
import LSAddProductModal from "./ls-add-product-modal";
import { useDeleteProduct, useGetProductFacets, useProducts, useSetFeaturedProduct, useSetSavedProduct } from "./use-products";
import { MAX_FEATURED_PRODUCTS, PRODUCT_TYPE_LABELS } from "@/lib/constants/product";
import { useUserProfile } from "../use-profile";

export default function LSProductsList({ userId }: { userId: string }) {
  const { user, loading: userLoading } = useAuthContext();
  const isOwner = user?.id === userId;

  const { data: profile } = useUserProfile(userId);

  const {
    data: prodFacets,
    isLoading: isLoadingFacets,
    isError: isErrorFacets
  } = useGetProductFacets(userId);
  const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ');
    return (options as ComboboxItem[]).filter((option) => {
      const words = option.label.toLowerCase().trim().split(' ');
      return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
    });
  };

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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingUserProducts,
    isError: isErrorUserProducts,
    isFetching: isFetchingProducts
  } = useProducts(userId, activeFilters);
  const products = userProducts?.pages.flatMap((p) => p.products) ?? [];

  const setSavedProduct = useSetSavedProduct(userId);

  const { ref: scrollRef, entry } = useIntersection({
    rootMargin: "200px",
    threshold: 1
  });

  const wasIntersecting = useRef(false);
  useEffect(() => {
    const isIntersecting = entry?.isIntersecting ?? false;

    if (isIntersecting && !wasIntersecting.current && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    wasIntersecting.current = isIntersecting;
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteProduct = useDeleteProduct(userId);

  const setFeaturedProduct = useSetFeaturedProduct(userId);
  const featuredCount = products?.filter((p) => p.is_featured).length ?? 0;

  if (isLoadingUserProducts || isLoadingFacets || userLoading) {
    return (
      <Center py='xl'>
        <Loader />
      </Center>
    )
  }

  if (isErrorUserProducts) {
    return (
      <Text ta='center' c='red' py='xl'>
        Failed to load products...
      </Text>
    )
  }

  return (
    <Stack w='100%' maw='800'> 
      <Group justify='space-between'>
        <Stack gap='0'>
          <Text fw='bold'>Products</Text>
          <Text size='xs' c='dimmed'>{prodFacets?.count ?? 0} research products {isOwner ? ' on your profile' : `from ${profile?.first_name} ${profile?.last_name}`}</Text>
        </Stack>
        {
          isOwner &&
          <LSAddProductModal userId={userId} />
        }
      </Group>

      {
        isErrorFacets ?
          <Text c='red' ta='center'>Failed to load user research products metadata</Text>
          :
          <Stack>
            <TextInput
              placeholder='Search by product title'
              styles={{ input: { background: 'var(--mantine-color-gray-1)' } }}
              leftSection={<IconSearch stroke='1.75' size='1rem' color='var(--mantine-color-gray-5)' />}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
            />
            <Group justify='space-between' wrap='nowrap'>
              <Group>
                <Select
                  placeholder='Research Topic'
                  data={prodFacets?.tags.map(
                    (tag) => ({
                      value: String(tag.id), label: `${tag.name} (${tag.count})`
                    })) ?? []
                  }
                  clearable
                  searchable
                  filter={optionsFilter}
                  nothingFoundMessage='No Matching Topics...'
                  onChange={(t) => setFilters((prev) => ({ ...prev, tagId: t }))}
                  comboboxProps={{ shadow: 'sm' }}
                  w='200'
                />
                <Select
                  placeholder='Type'
                  data={prodFacets?.types.map(
                    (t) => ({
                      value: String(t.type), label: `${PRODUCT_TYPE_LABELS[t.type]} (${t.count})`
                    })) ?? []
                  }
                  clearable
                  onChange={(type) => setFilters((prev) => ({ ...prev, type }))}
                  comboboxProps={{ shadow: 'sm' }}
                  w='175'
                />
              </Group>
              <Select
                w='125'
                placeholder='Sort by'
                data={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' }
                ]}
                allowDeselect={false}
                onChange={(sort) => setFilters((prev) => ({ ...prev, sort: (sort as 'newest' | 'oldest') ?? 'newest' }))}
                defaultValue='newest'
                comboboxProps={{ shadow: 'sm' }}
                leftSection={<IconAdjustmentsHorizontal stroke='1' color='var(--mantine-color-gray-5)' />}
              />
            </Group>
          </Stack>
      }
      <Divider />

      <Stack pos='relative'>
        {
          (isFetchingProducts && !isFetchingNextPage) &&
          <Loader mx='auto' />
        }
        {/* <LoadingOverlay
          visible={addPubByDoi.isPending || (isFetchingPubs && !isFetchingNextPage)}
          loaderProps={{ children: '' }}
        /> */}
        {
          products.length > 0 ?
          <Stack>
            {
              products.map((p) =>
                <LSProduct
                  key={p.product_id}
                  product={p}
                  isOwner={isOwner}
                  onDeleteClick={() => deleteProduct.mutate(p.product_id)}
                  isDeleting={deleteProduct.isPending}
                  onFeaturedClick={() => setFeaturedProduct.mutate({ productId: p.product_id, isFeatured: !p.is_featured })}
                  featureBtnDisabled={featuredCount >= MAX_FEATURED_PRODUCTS && !p.is_featured}
                  onSaveClick={() => setSavedProduct.mutate({ productId: p.product_id, isSaved: !p.isSaved })}
                />
              )
            }
          </Stack>
          : 
          <Text ta='center' c='dimmed'>
            No Products Found...
          </Text>
        }
      </Stack>

      <div ref={scrollRef} style={{ height: 1 }} />

      

      {isFetchingNextPage &&
        <Center py='md'>
          <Loader size='sm' />
        </Center>
      }
    </Stack>
  );
}