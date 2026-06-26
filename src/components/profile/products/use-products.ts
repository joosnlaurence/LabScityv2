import { createProduct, deleteProduct, setProductAsFeatured as setFeaturedProduct } from "@/lib/actions/product";
import { productKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { Product } from "@/lib/types/data";
import { CreateProductValues } from "@/lib/validations/product";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useProducts(userId: string) {
  return useQuery({
    queryKey: productKeys.list(userId),
    queryFn: async () => {
      const res = await fetch(`/api/products?userId=${userId}`);
      if(!res.ok) throw new Error("Failed to fetch products");
      const apiResponse: ApiResponse<Product[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    }
  })
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
    mutationFn: async (product: CreateProductValues) => {
      const res = await createProduct(product);
      if(!res.success) throw new Error(res.error);
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