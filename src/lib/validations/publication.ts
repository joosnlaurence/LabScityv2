import { z } from "zod";
import { PUBLICATION_TYPE_VALUES } from "../constants/publications";

export const createPublicationSchema = z.object({
    title: z
        .string()
        .min(1, { 
            message: "Title is required" })
        .max(120, { 
            message: "Title must be less than 120 characters" }),
    doi: z
        .string()
        .optional(),
    journal: z
        .string()
        .optional(),
    datePublished: z
        .iso.date()
        .optional(),
        // making an authors array for now, later creating a table to link authors to current users
    authors: z
       .array(z.string()).min(1, {
            message: "At least one author is required",
       }), // must contain 1 or more items
    publicationType: z
       .enum(PUBLICATION_TYPE_VALUES),
});


export type CreatePublicationValues = z.infer<typeof createPublicationSchema>;