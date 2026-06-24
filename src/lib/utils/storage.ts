export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // for 5 MB
export const PRODUCT_IMAGE_BUCKET = "product_images";

// MIME type converted to a file extension "image/jpeg" = jpg
export function extensionFromMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}