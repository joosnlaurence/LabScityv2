import type { PublicationType } from "../types/publication";

export const PUBLICATION_TYPE_LABELS = {
  journal_article: "Journal Article",
  book_chapter: "Book Chapter",
  conference_paper: "Conference Paper",
  preprint: "Preprint",
  dissertation: "Thesis / Dissertation",
  review_article: "Review Article",
  technical_report: "Report / Working Paper",
  other: "Other",
} as const satisfies Record<PublicationType, string>;

export const PUBLICATION_TYPE_VALUES = Object.keys(PUBLICATION_TYPE_LABELS) as PublicationType[]