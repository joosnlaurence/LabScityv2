
export const PRODUCT_TYPE_LABELS = {
  tool: "Tool",
  platform: "Platform",
  ai_tool: "AI Tool",
  simulation: "Simulation",
  other: 'Other',
} as const;

export type ProductType = keyof typeof PRODUCT_TYPE_LABELS;

export const PRODUCT_TYPE_VALUES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[] // getting the keys 

export const MAX_FEATURED_PRODUCTS = 3;
export const MAX_IMAGE_UPLOADS = 5;
export const MAX_PRODUCT_SUMMARY_LENGTH = 300;
export const TAGS_PAGE_SIZE = 25; // TODO: Change to like 15 once infinite scrolling is implemented

export const PRODUCT_IMAGE_BUCKET = "product_images";