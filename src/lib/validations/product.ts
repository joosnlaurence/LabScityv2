import { z } from "zod";
import { MAX_PRODUCT_SUMMARY_LENGTH, PRODUCT_TYPE_VALUES } from "../constants/product";

const allowedProductImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const productImageContentTypeSchema = z
  .string()
  .refine((value) => allowedProductImageTypes.includes(value as (typeof allowedProductImageTypes)[number]), {
    message: "Only JPG, PNG, and WEBP images are allowed",
  });

export const productImagePathSchema = z
  .string()
  .min(1, { message: "Image path is required" });

export const createProductSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Title is required"})
        .max(120, {
            message: "Title must be less than 120 characters" }), 
    short_summary: z
        .string()
        .min(1, {message: "Short summary is required" })
        .max(MAX_PRODUCT_SUMMARY_LENGTH, {message: " "}),
    publication_id: z
        .number()
        .int()
        .positive()
        .optional(),

    links: z
        .array(z.object({
          kind: z.enum(["website", "github", "other"], { message: "Invalid link type"}),
          label: z.string(),
          url: z.url({ message: "Enter a valid URL" })
        }))
        .refine(
          (links) => links.filter((l) => l.kind === 'website').length <= 1,
          { message: "Only one website link allowed" }
        )
        .refine(
          (links) => links.filter((l) => l.kind === 'github').length <= 1,
          { message: "Only one GitHub link allowed" }
        )
        .refine(
          (links) => links.filter((l) => l.kind === 'other').length <= 3,
          { message: "At most three additional links allowed" }
        )
        .optional(),

    images: z
        .array(z.string())
        .max(5, { message: "Up to 5 images allowed" })
        .optional(),

    contributors: z
        .array(z.string())
        .optional(),

    product_type: z
        .enum(PRODUCT_TYPE_VALUES)
        .optional(),

    tag_ids: z
        .array(z.number().int().positive())
        .max(3, { message: "Maximum of 3 tags allowed" }) // this number can change
        .optional(),
      
    is_featured: z
        .boolean()
        .optional(),
});  

export const updateProductSchema = createProductSchema.partial(); // partial because users might only update one field

export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;