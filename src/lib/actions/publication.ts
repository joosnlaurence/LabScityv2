"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
    createPublicationSchema,
    type CreatePublicationValues,
} from "@/lib/validations/publication";

import type { DataResponse, Publication } from "@/lib/types/data";

export async function createPublication(
  input: CreatePublicationValues
): Promise<DataResponse<Publication>> {
    try {
        const parsed = createPublicationSchema.parse(input);
        const supabase = await createClient();
        
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user){
            return { success: false, error: "Authentication required"}
        }

        const { data: publication, error: publicationError } = await supabase
            .from("publications")
            .insert({
                title: parsed.title,
                doi_link: parsed.doi || null,
                journal: parsed.journal || null,
                date_published: parsed.date_published ?? null,
                authors: parsed.authors ?? null,
                preview_path: parsed.preview_path ?? null,
                is_oa: parsed.is_oa ?? false,
                pdf_url: parsed.pdf_url || null,
                type: parsed.type ?? "other",
            })
            .select()
            .single();

        if(publicationError){
            return { success: false, error: publicationError.message}
        }

        const { error: linkError } = await supabase
            .from("user_publications")
            .insert({
                user_id: authData.user.id,
                publication_id: publication.publication_id
            });

        if(linkError){
            return { success: false, error: linkError.message };
        }

        return {
            success: true,
            data: publication,
        };

    } catch (error ){
        if(error instanceof z.ZodError){
            return {
                success: false,
                error: error.issues[0]?.message ?? "Validation failed",
            }
        }
        return {success: false, error: "Failed to create publication"};
    }
}