import { OPENALEX_TYPE_MAP } from "../constants/publications";
import { OpenAlexWork, ParsedOpenAlexWork } from "../types/publication";
import { doiSchema } from "../validations/publication";

export function parseOpenAlexWork(work: OpenAlexWork): ParsedOpenAlexWork {
  const pubType = OPENALEX_TYPE_MAP[work.type ?? ''] ?? 'other';

  const pdfUrl = 
    work.best_oa_location?.pdf_url ??
    work.primary_location?.pdf_url ??
    work.locations?.find((loc) => loc.pdf_url)?.pdf_url ??
    null;

  return {
    doi: work.doi ? (doiSchema.safeParse(work.doi).data ?? null) : null,
    title: work.title ?? '',
    authors: work.authorships.map((a) => a.author.display_name),
    type: pubType,
    journal: work.primary_location?.source?.display_name ?? null,
    publicationDate: work.publication_date,
    isOA: work.open_access?.is_oa ?? false,
    pdfUrl: pdfUrl,
    openAlexTopicIds: (work.topics ?? []).map((t) =>
      t.id.replace("https://openalex.org/", "")
    ),
  }
}