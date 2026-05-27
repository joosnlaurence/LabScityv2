import { z } from "zod";
import { PRODUCT_TYPE_VALUES } from "../constants/product";

export const createProductSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Title is required"})
        .max(120, {
            message: "Title must be less than 120 characters" }), 
    short_summary: z
        .string()
        .min(1, {
            message: "Description is required" }),
    website_link: z
        .string()
        .optional(),
    publication_id: z
        .number()
        .int()
        .positive()
        .optional(),

    image_path: z
        .string()
        .optional(),

    github_link: z
        .string()
        .optional(),

    other_links: z
        .array(z.string())
        .optional(),

    contributors: z
        .array(z.string())
        .optional(),

    is_featured: z
        .boolean()
        .optional(),

    product_type: z
        .enum(PRODUCT_TYPE_VALUES)
        .optional(),

    tag_ids: z
        .array(z.number().int().positive())
        .max(3, { message: "Maximum of 3 tags allowed" }) // this number can change
        .optional(),
});  

export const updateProductSchema = createProductSchema.partial(); // partial because users might only update one field

export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;