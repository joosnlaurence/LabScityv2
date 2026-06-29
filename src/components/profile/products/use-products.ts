import { createProduct, createProductImageUploadUrl, deleteProduct, saveProductImagePaths, setProductAsFeatured as setFeaturedProduct } from "@/lib/actions/product";
import { TAGS_PAGE_SIZE } from "@/lib/constants/product";
import { productKeys, tagKeys } from "@/lib/query-keys";
import { ApiResponse, InfiniteScrollResponse } from "@/lib/types/api";
import { Product, ProductImageDraft, TagSearchResult } from "@/lib/types/data";
import { InfiniteProducts, ProductFacets, ProductFilters } from "@/lib/types/products";
import { CreateProductValues } from "@/lib/validations/product";
import { createClient } from "@/supabase/client";
import { notifications } from "@mantine/notifications";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useProducts(userId: string, filters: ProductFilters) {
  return useInfiniteQuery({
      queryKey: productKeys.list(userId, filters),
      initialPageParam: null as { created_at: string, product_id: number } | null,
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ userId });
        if(filters.search) params.set('search', filters.search);
        if(filters.tagId) params.set('tagId', filters.tagId);
        if(filters.type) params.set('type', filters.type);
        if(filters.sort) params.set('sort', filters.sort);
  
        if(pageParam) {
          params.set("cursor", btoa(JSON.stringify(pageParam)));  
        }
        const res = await fetch(`/api/products?${params}`);
        if(!res.ok) throw new Error("Failed to fetch publications");
        const apiResponse: ApiResponse<InfiniteProducts> = await res.json();
        if(!apiResponse.success) throw new Error(apiResponse.error)
        return apiResponse.data;
      },
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      placeholderData: keepPreviousData
    })
}

export function useGetProductFacets(userId: string) {
  return useQuery({
    queryKey: productKeys.facets(userId),
    queryFn: async () => {
      const res = await fetch(`/api/products/facets?userId=${userId}`);
      if(!res.ok) throw new Error('Failed to fetch publication facets');
      const apiResponse: ApiResponse<ProductFacets> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    }
  })
}

async function uploadProductImages(productId: number, images: ProductImageDraft[]) {
  const supabase = createClient();

  const results = await Promise.allSettled(
    images.map(async (img) => {
      const prep = await createProductImageUploadUrl(productId, img.file.type);
      if (!prep.success || !prep.data) throw new Error(prep.error ?? "Upload prep failed");

      const { path, token } = prep.data;
      const { error } = await supabase.storage
        .from(prep.data.bucket)
        .uploadToSignedUrl(path, token, img.file);
      if (error) throw error;
      return {
        image_path: prep.data.path,
        width: img.width,
        height: img.height
      };
    }),
  );

  const uploaded = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  if (uploaded.length > 0) {
    const saved = await saveProductImagePaths(productId, uploaded);
    if (!saved.success) throw new Error(saved.error);
  }

  return { total: images.length, uploaded: uploaded.length };
}

export function useCreateProduct({
  userId,
  onSuccess,
}: {
  userId: string,
  onSuccess: () => void
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({product, images}: {product: CreateProductValues, images: ProductImageDraft[]}) => {
      const res = await createProduct(product);
      if(!res.success) throw new Error(res.error);

      if(images.length > 0) {
        try {
          const { total, uploaded } = await uploadProductImages(res.data!.product_id, images);
          if (uploaded < total) {
            notifications.show({
              color: "yellow",
              title: "Some images didn't upload",
              message: `${uploaded} of ${total} previews saved. You can add the rest by editing the product.`,
            });
          }
        } catch(err) {
          notifications.show({
            color: "yellow",
            title: "Error uploading images",
            message: "There was an unknown error uploading some images."
          });
        }
      }

      return res.data;
    },
    onError: (error, _doi, context) => {
      notifications.show({
        color: "red",
        title: "Error adding product",
        message: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(userId) })
    },
    onSuccess: () => {
      onSuccess?.();
      notifications.show({color: 'green', message: 'Product Added!'});
    }
  });
}

export function useDeleteProduct(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await deleteProduct(productId); 
      if(!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(userId) });
      notifications.show({color: 'green', message: 'Product successfully deleted!'})
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: 'Couldn\'t delete Product',
        message: err.message
      });
    }
  })
}

export function useSetFeaturedProduct(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      { productId, isFeatured }
      :
      { productId: number, isFeatured: boolean }) => {
      const res = await setFeaturedProduct(productId, isFeatured);
      if(!res.success) throw new Error(res.error);
      return res.success;
    },
    onSuccess: (_data, {productId, isFeatured}) => {
      notifications.show({color: 'green', message: `Product ${isFeatured ? 'pinned' : 'unpinned'}!`});
    },
    onError: (error, _vars, context) => {
      notifications.show({
        color: "red",
        title: "Error pinning product",
        message: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(userId) });
    }
  });
}

export function useSearchTags(search: string) {
  // return useInfiniteQuery({
  //   queryKey: tagKeys.search(search),
  //   initialPageParam: 0,
  //   queryFn: async ({ pageParam }) => {
  //     const res = await fetch(`/api/tags/search?q=${encodeURIComponent(search)}&limit=${TAGS_PAGE_SIZE}&offset=${pageParam}`);
  //     if(!res.ok) throw new Error("Failed to fetch products");
  //     const apiResponse: InfiniteScrollResponse<TagSearchResult[]> = await res.json();
  //     if(!apiResponse.success) throw new Error(apiResponse.error);
  //     return apiResponse;
  //   },
  //   getNextPageParam: (last, all) => last.hasMore ? all.length * TAGS_PAGE_SIZE : undefined,
  //   // enabled: search.trim().length > 0,
  //   placeholderData: keepPreviousData,
  // })
  return useQuery({
    queryKey: tagKeys.search(search),
    queryFn: async () => {
      const res = await fetch(`/api/tags/search?q=${encodeURIComponent(search)}&limit=${TAGS_PAGE_SIZE}`);
      if(!res.ok) throw new Error("Failed to fetch products");
      const apiResponse: InfiniteScrollResponse<TagSearchResult[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    },
    // enabled: search.trim().length > 0,
    placeholderData: keepPreviousData,
  })
}