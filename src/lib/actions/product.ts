"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
    createProductSchema,
    type CreateProductValues,
} from "@/lib/validations/product";

import type { DataResponse, Product } from "@/lib/types/data";

export async function createProduct(
  input: CreateProductValues
): Promise<DataResponse<Product>> {
    try {
        const parsed = createProductSchema.parse(input);

        const supabase = await createClient();

        const { data: authData } = await supabase.auth.getUser();

        if(!authData.user) {
            return { 
                success: false, error: "Authentication required"
            };
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
                return { 
                    success: false, error: linkedPublicationError.message
                };
            }

            if (!linkedPublication){
                return { 
                    success: false, error: "Publication link is invalid"
                };
            }
        }

        const { data: product, error: productError} = await supabase
            .from("products")
            .insert({
                title: parsed.title,
                short_summary: parsed.short_summary ?? null,
                website_link: parsed.website_link || null,
                publication_id: parsed.publication_id ?? null,
                image_path: parsed.image_path ?? null,
                github_link: parsed.github_link || null,
                other_links: parsed.other_links ?? [],
                contributors: parsed.contributors ?? [],
                is_featured: parsed.is_featured ?? false,
                product_type: parsed.product_type ?? null,
            })
            .select()
            .single();
            
        if (productError){
            return {
                success: false, 
                error: productError.message
            };
        }

        const { error: linkError } = await supabase
            .from("user_products")
            .insert({
                user_id: authData.user.id,
                product_id: product.product_id,
            });

        if (linkError) {
            return { 
                success: false, error: linkError.message
            };
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
            };
        }
        return {
            success: false, error: "Failed to create product"
        };
    }
} 