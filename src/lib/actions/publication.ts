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

// gets the logged in user, checks that the publication id is valid and belongs to the user, then deletes the row
// also deleted from the join table
// returns the deleted publication id

export async function deletePublication(
    publicationId: number
): Promise<DataResponse<{ publication_id: number }>> {
    try {
        const supabase = await createClient();

        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        if (!Number.isInteger(publicationId) || publicationId <= 0) {
            return {
                success: false,
                error: "Invalid publication id",
            };
        }

        const { data: existingPublication, error: ownershipError } =
            await supabase
                .from("user_publications")
                .select("publication_id")
                .eq("user_id", authData.user.id)
                .eq("publication_id", publicationId)
                .maybeSingle();

        if (ownershipError) {
            return {
                success: false,
                error: ownershipError.message,
            };
        }

        if (!existingPublication) {
            return {
                success: false,
                error: "Publication not found or unauthorized",
            };
        }

        const { error: deleteError } = await supabase
            .from("publications")
            .delete()
            .eq("publication_id", publicationId);

        if (deleteError) {
            return {
                success: false,
                error: deleteError.message,
            };
        }

        return {
            success: true,
            data: {
                publication_id: publicationId,
            },
        };
    } catch {
        return {
            success: false,
            error: "Failed to delete publication",
        };
    }
}