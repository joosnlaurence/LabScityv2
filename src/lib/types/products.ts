export interface ProductFilters {
  search: string;
  tagId: string | null;
  type: string | null;
  sort: 'newest' | 'oldest';
}