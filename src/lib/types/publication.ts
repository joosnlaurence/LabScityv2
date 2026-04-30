// publication_type enum values from supabase
export type PublicationType =
  | "journal_article"
  | "book_chapter"
  | "conference_paper"
  | "preprint"
  | "dissertation"
  | "review_article"
  | "technical_report"
  | "other";

export interface Publication {
  publication_id: number;
  title: string;
  doi_link: string | null;
  journal: string | null;
  date_published: string | null;
  authors: string[];
  type: PublicationType;
  preview_path: string | null;
  is_oa: boolean;
  pdf_url: string | null;
  is_featured: boolean;
  topics: string[];
}