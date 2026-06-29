export type StructuredPostKind = "normal" | "product" | "publication";

export interface StructuredPostLinkedEntity {
  type: "product" | "publication";
  id: number;
  title: string;
}

export interface StructuredPostPayload {
  version: 1;
  kind: StructuredPostKind;
  title: string;
  bodyHtml: string;
  bodyText: string;
  tags: string[];
  isFeatured: boolean;
  linkedEntity: StructuredPostLinkedEntity | null;
}

export interface ParsedPostContent {
  isStructured: boolean;
  title: string;
  bodyHtml: string | null;
  bodyText: string;
  tags: string[];
  isFeatured: boolean;
  kind: StructuredPostKind;
  linkedEntity: StructuredPostLinkedEntity | null;
  legacyText: string;
}

const POST_CONTENT_PREFIX = "[[LABSCITY_POST_V1]]";

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export function normalizePostTags(tags: string[]) {
  const seen = new Set<string>();

  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .slice(0, 8);
}

function fallbackTitleFromBody(text: string) {
  const trimmed = normalizeText(text);

  if (!trimmed) {
    return "Untitled research update";
  }

  const firstSentence = trimmed.split(/[.!?]\s/)[0]?.trim() || trimmed;
  return firstSentence.length > 90
    ? `${firstSentence.slice(0, 87).trim()}...`
    : firstSentence;
}

export function encodeStructuredPostContent(
  input: Omit<StructuredPostPayload, "version">,
) {
  const payload: StructuredPostPayload = {
    version: 1,
    kind: input.kind,
    title: input.title.trim(),
    bodyHtml: input.bodyHtml.trim(),
    bodyText: normalizeText(input.bodyText),
    tags: normalizePostTags(input.tags),
    isFeatured: input.isFeatured ?? false,
    linkedEntity: input.linkedEntity,
  };

  return `${POST_CONTENT_PREFIX}${JSON.stringify(payload)}`;
}

export function parsePostContent(
  rawContent: string | null | undefined,
): ParsedPostContent {
  const raw = rawContent ?? "";

  if (!raw.startsWith(POST_CONTENT_PREFIX)) {
    const legacyText = normalizeText(raw);

    return {
      isStructured: false,
      title: fallbackTitleFromBody(legacyText),
      bodyHtml: null,
      bodyText: legacyText,
      tags: [],
      isFeatured: false,
      kind: "normal",
      linkedEntity: null,
      legacyText,
    };
  }

  try {
    const parsed = JSON.parse(raw.slice(POST_CONTENT_PREFIX.length)) as Partial<
      StructuredPostPayload
    >;

    const bodyText = normalizeText(parsed.bodyText ?? "");
    const title =
      normalizeText(parsed.title ?? "") || fallbackTitleFromBody(bodyText);

    return {
      isStructured: true,
      title,
      bodyHtml:
        typeof parsed.bodyHtml === "string" && parsed.bodyHtml.trim().length > 0
          ? parsed.bodyHtml
          : null,
      bodyText,
      tags: normalizePostTags(Array.isArray(parsed.tags) ? parsed.tags : []),
      isFeatured: Boolean(parsed.isFeatured),
      kind:
        parsed.kind === "product" || parsed.kind === "publication"
          ? parsed.kind
          : "normal",
      linkedEntity:
        parsed.linkedEntity &&
        (parsed.linkedEntity.type === "product" ||
          parsed.linkedEntity.type === "publication") &&
        typeof parsed.linkedEntity.id === "number" &&
        typeof parsed.linkedEntity.title === "string"
          ? parsed.linkedEntity
          : null,
      legacyText: [title, bodyText].filter(Boolean).join("\n\n"),
    };
  } catch {
    const legacyText = normalizeText(raw);

    return {
      isStructured: false,
      title: fallbackTitleFromBody(legacyText),
      bodyHtml: null,
      bodyText: legacyText,
      tags: [],
      isFeatured: false,
      kind: "normal",
      linkedEntity: null,
      legacyText,
    };
  }
}

export function getLegacyPostText(rawContent: string | null | undefined) {
  return parsePostContent(rawContent).legacyText;
}
