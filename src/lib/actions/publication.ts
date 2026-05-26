"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
    createPublicationSchema,
    doiSchema,
    updatePublicationSchema,
    type CreatePublicationValues,
    type UpdatePublicationValues
} from "@/lib/validations/publication";

import type { DataResponse, Publication } from "@/lib/types/data";
import { OpenAlexWork } from "../types/publication";
import { OPENALEX_TYPE_MAP } from "../constants/publications";

export async function addPublicationByDoi(
  doi: string
): Promise<DataResponse<Publication>> {
  try{
    const parsedDoi = doiSchema.parse(doi);
    const res = await fetch(`https://api.openalex.org/works/doi:${parsedDoi}`);
    if(!res.ok) throw new Error(`OpenAlex Error: ${res.status}`);
    const data: OpenAlexWork = await res.json();

    const pubType = OPENALEX_TYPE_MAP[data.type ?? ''] ?? 'other';

    const parsed: CreatePublicationValues = {
      doi: parsedDoi,
      title: data.title ?? '',
      authors: data.authorships.map((a) => a.author.display_name),
      publicationType: pubType,
      journal: data.primary_location?.source?.display_name ?? undefined,
      datePublished: data.publication_date ?? undefined,
      previewPath: undefined,
      isOA: data.open_access?.is_oa,
      pdfUrl: data.open_access?.oa_url ?? undefined
    }

    return createPublication(parsed);
  } catch(err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Invalid DOI"};
    }
    return { success: false, error: 'Failed to add publication'};
  }
}

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
                doi: parsed.doi || null,
                journal: parsed.journal || null,
                date_published: parsed.datePublished ?? null,
                authors: parsed.authors ?? null,
                preview_path: parsed.previewPath ?? null,
                is_oa: parsed.isOA ?? false,
                pdf_url: parsed.pdfUrl || null,
                type: parsed.publicationType ?? "other",
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

// validates the input, with partial letter users update fields optionally
// gets the logged in user, returns early if not authenticated
// make sure the publicationId is a valid positive integer
// confirms that the user owns the publication, and returns unauthorized otherwise
// returns the updated publication row

export async function updatePublication(
    publicationId: number,
    input: UpdatePublicationValues
): Promise<DataResponse<Publication>> {
    try {
        const parsed = updatePublicationSchema.parse(input); 
        const supabase = await createClient(); 

        const { data: authData } = await supabase.auth.getUser(); 

        if(!authData.user){ // will return early if it's not authenticated
            return {
                success: false,
                error: 'Authentication Required',
            }
        }
        
        if (!Number.isInteger(publicationId) || publicationId <= 0) {
            return {
                success: false,
                error: "Invalid publication id",
            };
        }

        const { data: existingPublication, error: ownershipError } = await supabase
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
                error: "Publication not found or unauthorized" 
            };
        }

        const updateData = Object.fromEntries(
            Object.entries({
                title: parsed.title,
                doi: parsed.doi,
                journal: parsed.journal,
                date_published: parsed.datePublished,
                authors: parsed.authors,
                preview_path: parsed.previewPath,
                is_oa: parsed.isOA,
                pdf_url: parsed.pdfUrl,
                type: parsed.publicationType ?? "other",
            }).filter(([, value]) => value !== undefined)
        );

        const { data: publication, error: updateError } = await supabase
            .from("publications")
            .update(updateData)
            .eq("publication_id", publicationId)
            .select()
            .single();

        if (updateError){
            return {
                success: false,
                error: updateError.message
            };
        }    

        return {
            success: true,
            data: publication,
        };

    } catch (error){
        if(error instanceof z.ZodError){
            return {
                success: false,
                error: error.issues[0]?.message ?? "Validation failed",
            };
        }
        return { 
            success: false, 
            error: "failed to update the publication"
        };
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