export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function derivePostTagsFromDetail(post: {
  scientificField: string;
  content: string;
  mediaUrl?: string | null;
}) {
  const tags: string[] = [];
  const normalizedContent = post.content.toLowerCase();
  const normalizedField = post.scientificField.trim().toLowerCase();

  const looksLikeArticle =
    normalizedContent.includes("doi.org/") ||
    normalizedContent.includes("doi:") ||
    normalizedContent.includes("published in") ||
    normalizedContent.includes("journal") ||
    normalizedContent.includes("full-text");

  if (looksLikeArticle) {
    tags.push("Article");
  }

  if (post.mediaUrl && normalizedContent.includes("full-text")) {
    tags.push("Full-text available");
  }

  if (
    looksLikeArticle &&
    normalizedField &&
    normalizedField !== "general" &&
    normalizedField !== "other"
  ) {
    tags.push(post.scientificField);
  }

  return tags;
}
