import { z } from "zod";

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

    //picture
});  

export type CreateProductValues = z.infer<typeof createProductSchema>;