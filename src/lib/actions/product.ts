"use server";

import { z } from "zod";

import {
    createProductSchema,
    type CreateProductValues,
} from "@/lib/validations/product";
import {createClient} from "@/supabase/server";

type UserProductRow = {
    products: any;
}

export async function createProduct(
    input: CreateProductValues,
    supabaseClient?: any
){
    try {
        const parsed = createProductSchema.parse(input);

        const supabase = supabaseClient ?? (await createClient());

        const authData = {
            user: { id: "b798c0c3-bd97-4595-8ac1-d05029206303"}
        };

        if(!authData.user){
            return { success: false, error: "Authentication required"}
        }

        if (parsed.publication_id !== undefined) {
            const { data: linkedPublication, error: linkedPublicationError } =
                await supabase
                    .from("user_publications")
                    .select("publication_id")
                    .eq("user_id", authData.user.id)
                    .eq("publication_id", parsed.publication_id)
                    .maybeSingle(); // because may receive 0 or 1 row back
                
            if (linkedPublicationError){
                return { success: false, error: linkedPublicationError.message};
            }

            if (!linkedPublication){
                return { success: false, error: "Publication link is invalid"};
            }
        }

        const { data: product, error: productError} = await supabase
            .from("products")
            .insert({
                title: parsed.title,
                short_summary: parsed.short_summary,
                website_link: parsed.website_link ?? null,
                publication_id: parsed.publication_id ?? null,
            })
            .select()
            .single();
        if (productError){
            return { success: false, error: productError.message};
        }

        const {error: linkError } = await supabase.from("user_products").insert({
            user_id: authData.user.id,
            product_id: product.product_id,
        });

        if (linkError){
            return { success: false, error: linkError.message};
        }

        return {
            success: true,
            data: product,
        };
    } catch (error){
        if(error instanceof z.ZodError){
            return {
                success: false,
                error: error.issues[0]?.message ?? "Validation failed",
            }
        }
        return {success: false, error: "Failed to create product"};
    }
} 

export async function getUserProducts(userId: string){
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_products")
        .select(`
            products (*)
        `)
        .eq("user_id", userId)
    if (error){
        return { success: false, error: error.message};
    }

    return {
        success: true,
        data: (data ?? []).map((row) => row.products),
    };
}