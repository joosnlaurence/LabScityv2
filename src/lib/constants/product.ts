export const PRODUCT_TYPE_LABELS = {
  // custom labscity tpyes
  tool: "Tool",
  ai_tool: "AI Tool",
  platform: "Platform",
  simulation: "Simulation",
  other: "Other",
  // openalex product types
  dataset: "Dataset",
  software: "Software",
  preprint: "Preprint",
  conference_abstract: "Conference Abstract",
  dissertation: "Thesis / Dissertation",
  editorial: "Editorial",
  letter: "Letter",
  libguides: "LibGuide",
  paratext: "Paratext",
  peer_review: "Peer Review",
  reference_entry: "Reference Entry",
  technical_report: "Report / Working Paper",
  retraction: "Retraction",
  standard: "Standard",
  supplementary_materials: "Supplementary Materials",
  erratum: "Erratum",
  review_article: "Review Article",
  data_paper: "Data Paper"
} as const;

export type ProductType = keyof typeof PRODUCT_TYPE_LABELS;
export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];

export const PRODUCT_TYPE_VALUES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[] // getting the keys 

export const MAX_FEATURED_PRODUCTS = 3;
export const MAX_IMAGE_UPLOADS = 5;
export const MAX_PRODUCT_SUMMARY_LENGTH = 300;
export const PRODUCT_IMAGE_BUCKET = "product_images";