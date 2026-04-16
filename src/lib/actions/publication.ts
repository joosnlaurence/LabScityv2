"use server";

import { z } from "zod";

import {
    createPublicationSchema,
    type CreatePublicationValues,
} from "@/lib/validations/publication";
import { createClient } from "@/supabase/server";

/*  UserPublicationRow = {
    publications: any;
} */

export async function createPublication(
    input: CreatePublicationValues, 
    supabaseClient?: any
){
    try {
        const parsed = createPublicationSchema.parse(input);

        const supabase = supabaseClient ?? (await createClient());
        
        const authData = {
            user: { id: "b798c0c3-bd97-4595-8ac1-d05029206303"}
        };

        //commenting out for now for local testing
        //const { data: authData } = await supabase.auth.getUser();

        if (!authData.user){
            return { success: false, error: "Authentication required"}
        }

        const { data: publication, error: publicationError } = await supabase
            .from("publications")
            .insert({
                title: parsed.title,
                doi_link: parsed.doi ?? null,
                journal: parsed.journal ?? null,
                date_published: parsed.date_published ?? null,
                authors: parsed.authors,
            })
            .select()
            .single();

            if(publicationError){
                return { success: false, error: publicationError.message}
            }

            const { error: linkError } = await supabase.from("user_publications").insert({
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

/*
export async function getUserPublications(userId: string){
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_publications")
        .select(`
            publications (*)
        `)
        .eq("user_id", userId);

    if (error){
        return { success: false, error: error.message };
    }

    return {
        success: true, 
        data: (data ?? []).map((row: UserPublicationRow) => row.publications),
    };
} */