import { OPENALEX_WORK_TYPE_LABELS } from "../constants/openalex";

export type OpenAlexTypeDesignation = "publication" | "product" | "publication_product";
export type OpenAlexWorkType = keyof typeof OPENALEX_WORK_TYPE_LABELS;

export const OPENALEX_TYPE_DESIGNATIONS: Record<OpenAlexWorkType, OpenAlexTypeDesignation> = {
  journal_article: "publication",
  book: "publication",
  book_chapter: "publication",
  book_review: "publication",
  conference_abstract: "product",
  conference_paper: "publication",
  data_paper: "publication_product",
  dataset: "product",
  dissertation: "product",
  editorial: "product",
  erratum: "publication_product",
  letter: "product",
  libguides: "product",
  other: "product",
  paratext: "product",
  peer_review: "product",
  preprint: "product",
  reference_entry: "product",
  technical_report: "product",
  retraction: "product",
  review_article: "publication_product",
  software: "product",
  software_paper: "publication",
  standard: "product",
  supplementary_materials: "product",
};