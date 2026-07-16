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
    release_date: string | null,
    product_id: number
  } | null
}

export const PRODUCT_TYPES = OPENALEX_TYPE_DESIGNATIONS

const PRODUCT_LINK_KINDS = ['website', 'github', 'other'] as const;
export type ProductLinkKind = (typeof PRODUCT_LINK_KINDS)[number];

export type ProductLink = { url: string; kind: ProductLinkKind; label: string };

export type ProductInsertRow = {
  workId: string;
  title: string;
  contributors: string[];
  type: ProductType;
  links: ProductLink[];
  openAlexTopicIds: string[];
};