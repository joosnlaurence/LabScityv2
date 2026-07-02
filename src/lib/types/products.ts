import { OPENALEX_TYPE_VALUES } from "../constants/openalex";
import { ProductType } from "../constants/product";
import { Product } from "./data";
import { OPENALEX_TYPE_DESIGNATIONS } from "./openalex";

export interface ProductFilters {
  search: string;
  tagId: string | null;
  type: string | null;
  sort: 'newest' | 'oldest';
}

export interface ProductFacets {
  types: { type: ProductType, count: number }[]
  tags: { id: number, name: string, count: number }[]
  count: number
}

export interface InfiniteProducts {
  products: Product[],
  nextCursor: {
    created_at: string
    product_id: number
  } | null
}

export const PRODUCT_TYPES = OPENALEX_TYPE_DESIGNATIONS