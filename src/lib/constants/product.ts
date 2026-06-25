
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