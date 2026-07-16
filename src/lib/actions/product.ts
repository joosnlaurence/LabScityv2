"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
  createProductSchema,
  updateProductSchema,
  productImageContentTypeSchema,
  productImagePathSchema,
  type CreateProductValues,
  type UpdateProductValues,
} from "@/lib/validations/product";

import type { DataResponse, Product } from "@/lib/types/data";
import type { ProductImageUploadData } from "@/lib/types/api";
import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET, extensionFromMime } from "@/lib/utils/storage";
import { MAX_FEATURED_PRODUCTS, MAX_IMAGE_UPLOADS as MAX_PRODUCT_PREVIEWS, ProductType } from "../constants/product";
import { ParsedOpenAlexWork } from "../types/publication";
import { doiSchema, parsedProductWorkSchema } from "../validations/publication";
import { ProductInsertRow, ProductLink } from "../types/products";
// allows the user to remove a productTag
export async function deleteProductTopics(
  productId: number,
  tagId: number,
): Promise<DataResponse<{ tag_id: number }>> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return {
      success: false,
      error: 'Authentication Required'
    };
  }

  const { data: existingProduct, error: ownershipError } = await supabase
    .from('user_products')
    .select('product_id')
    .eq('user_id', authData.user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (ownershipError) {
    return {
      success: false,
      error: ownershipError.message,
    };
  }

  if (!existingProduct) {
    return {
      success: false,
      error: "Product not found or unauthorized"
    };
  }

  const { error: deleteError } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId)
    .eq('tag_id', tagId);

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message,
    };
  }

  return {
    success: true,
    data: {
      tag_id: tagId,
    },
  };
}

async function linkProductTopics(
  productId: number,
  tagIds: number[],
): Promise<void> {
  const supabase = await createClient();

  const links = tagIds.map((tagId) => ({
    product_id: productId,
    tag_id: tagId,
  }));

  const { error: linkError } = await supabase
    .from("product_tags")
    .upsert(links, { onConflict: "product_id,tag_id" });
  // onConflict prevents the user from adding duplicate tags

  if (linkError) {
    console.warn("Failed to link product tags:", linkError.message);
  }
}

// to add new tags after creating a product
// user will search for a tag with autofil
// user can select tags from results, tags will be linked in product_tags 
export async function addProductTopics(
  productId: number,
  tagIds: number[],
): Promise<DataResponse<void>> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return {
      success: false, error: 'Authentication Required'
    };
  }

  const { data: existingProduct, error: ownershipError } = await supabase
    .from("user_products")
    .select("product_id")
    .eq("user_id", authData.user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (ownershipError) {
    return {
      success: false, error: ownershipError.message
    };
  }

  if (!existingProduct) {
    return {
      success: false,
      error: "Product not found or unauthorized"
    };
  }

  // counts the total number of rows
  const { count, error: countError } = await supabase
    .from("product_tags")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) {
    return { success: false, error: countError.message };
  }

  if ((count ?? 0) + tagIds.length > 3) {
    return { success: false, error: "Maximum of 3 tags allowed" };
  }

  await linkProductTopics(productId, tagIds);

  return { success: true };
}

// user fills out a product form passing in title, summary, link, and optional tags
// createProduct inserts into the products table, links the product to user in user_proudcts
// if tags were selected using the autofill tag search, it calls linkProductTopics to add the tags to product_tags 
export async function createProduct(
  input: CreateProductValues
): Promise<DataResponse<Product>> {
  try {
    const parsed = createProductSchema.parse(input);

    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    if (parsed.publication_id !== undefined) {
      const { data: linkedPublication, error: linkedPublicationError } =
        await supabase
          .from("user_publications")
          .select("publication_id")
          .eq("user_id", authData.user.id)
          .eq("publication_id", parsed.publication_id)
          .maybeSingle(); // because may receive 0 or 1 rows back

      if (linkedPublicationError) {
        return {
          success: false,
          error: linkedPublicationError.message
        };
      }

      if (!linkedPublication) {
        return {
          success: false,
          error: "Publication link is invalid"
        };
      }
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        title: parsed.title,
        short_summary: parsed.short_summary ?? null,
        publication_id: parsed.publication_id ?? null,
        links: parsed.links ?? [],
        contributors: parsed.contributors ?? [],
        product_type: parsed.product_type ?? null,
      })
      .select()
      .single();

    if (productError) {
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

    // user can search for tags using tags/search autofill
    // will select a tag, and then attempts to add parsed product id and tag_ids to the product_tags table
    if (parsed.tag_ids && parsed.tag_ids.length > 0) {
      await linkProductTopics(product.product_id, parsed.tag_ids);
    }

    return {
      success: true,
      data: product,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
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

// validates the input, with partial letter users update fields optionally
// gets the logged in user, returns early if not authenticated
// make sure the publicationId is a valid positive integer
// confirms that the user owns the publication, and returns unauthorized otherwise
// returns the updated product row
export async function updateProduct(
  productId: number,
  input: UpdateProductValues
): Promise<DataResponse<Product>> {
  try {
    const parsed = updateProductSchema.parse(input);
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        error: 'Invalid product id',
      };
    }

    const { data: existingProduct, error: ownershipError } = await supabase
      .from("user_products")
      .select("product_id")
      .eq("user_id", authData.user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (ownershipError) {
      return {
        success: false,
        error: ownershipError.message,
      }
    }

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found or unauthorized"
      }
    }

    if (parsed.publication_id !== undefined) {
      const { data: linkedPublication, error: linkedPublicationError } = await supabase
        .from("user_publications")
        .select("publication_id")
        .eq("user_id", authData.user.id)
        .eq("publication_id", parsed.publication_id)
        .maybeSingle();

      if (linkedPublicationError) {
        return {
          success: false,
          error: linkedPublicationError.message
        };
      }

      if (!linkedPublication) {
        return {
          success: false,
          error: "Publication link is invalid"
        };
      }
    }

    const updateData = Object.fromEntries(
      Object.entries({
        title: parsed.title,
        short_summary: parsed.short_summary,
        links: parsed.links,
        publication_id: parsed.publication_id,
        contributors: parsed.contributors,
        product_type: parsed.product_type,
      }).filter(([, value]) => value !== undefined)
    );

    const { data: product, error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("product_id", productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    if (parsed.is_featured !== undefined) {
      const { error: setFeaturedProductError } = await supabase
        .from("user_products")
        .update({ is_featured: parsed.is_featured })
        .eq("product_id", productId)
        .eq("user_id", authData.user.id);

      if (setFeaturedProductError) {
        return { success: false, error: setFeaturedProductError.message };
      }
    }

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed"
      };
    }
    return {
      success: false,
      error: "failed to update the product"
    }
  }
}

export async function setFeaturedProduct(
  productId: number,
  isFeatured: boolean
) {
  try {
    if (!Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        error: "Invalid product id",
      };
    }

    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (isFeatured) {
      const { count, error: validationError } =
        await supabase
          .from("user_products")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", authData.user.id)
          .eq("is_featured", true);

      if (validationError) {
        return {
          success: false,
          error: validationError.message
        };
      }

      if ((count ?? 0) >= MAX_FEATURED_PRODUCTS) {
        return {
          success: false,
          error: `You can only feature up to ${MAX_FEATURED_PRODUCTS} products`
        };
      }
    }

    const { data: product, error } =
      await supabase
        .from("user_products")
        .update({ is_featured: isFeatured })
        .eq("user_id", authData.user.id)
        .eq("product_id", productId)
        .select()
        .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!product) {
      return {
        success: false,
        error: 'Product does not exist or user not authorized'
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[setFeaturedProduct] error:", error);
    return {
      success: false,
      error: "Failed to set featured product"
    };
  }
}
export async function createProductImageUploadUrl(
  productId: number,
  contentType: string,
): Promise<DataResponse<ProductImageUploadData>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { success: false, error: 'Authentication required' };
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      success: false,
      error: 'Invalid product id',
    };
  }

  const { data: existingProduct, error: ownershipError } = await supabase
    .from("user_products")
    .select("product_id")
    .eq("user_id", authData.user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (ownershipError) {
    return {
      success: false,
      error: ownershipError.message,
    }
  }

  if (!existingProduct) {
    return {
      success: false,
      error: "Product not found or unauthorized"
    }
  }

  const { count, error: countError } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) {
    return {
      success: false,
      error: countError.message
    };
  }

  if ((count ?? 0) >= 5) {
    return {
      success: false,
      error: "A maximum of 5 images are allowed"
    }
  }

  try {
    // to check that this is one of the allowed image types
    const validatedContentType = productImageContentTypeSchema.parse(contentType);
    const extension = extensionFromMime(validatedContentType);
    const path = `products/${productId}/${crypto.randomUUID()}.${extension}`;  // to build the bucket file path

    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .createSignedUploadUrl(path); // to create a temp authorized URL for frontned to upload file to storage

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Image upload preparation failed"
      };
    }

    return {
      success: true,
      data: {
        bucket: PRODUCT_IMAGE_BUCKET,
        path,
        token: data.token,
        maxBytes: MAX_PRODUCT_IMAGE_BYTES,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Invalid content type"
      };
    }
    return {
      success: false,
      error: "Failed to prepare image upload"
    };
  }
}

export async function saveProductImagePaths(
  productId: number,
  images: { image_path: string; width: number; height: number; }[],
): Promise<DataResponse<{ count: number }>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return { success: false, error: 'Authentication required' };
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        error: 'Invalid product id',
      };
    }

    const { data: existingProduct, error: ownershipError } = await supabase
      .from("user_products")
      .select("product_id")
      .eq("user_id", authData.user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (ownershipError) {
      return {
        success: false,
        error: ownershipError.message,
      }
    }

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found or unauthorized"
      }
    }

    const paths = images.map((i) => productImagePathSchema.parse(i.image_path));
    if(paths.some((p) => !p.startsWith(`products/${productId}/`))) {
      return {
        success: false,
        error: "Invalid image path"
      }
    }
    if(paths.length > MAX_PRODUCT_PREVIEWS) {
      return {
        success: false,
        error: "A maximum of 5 images are allowed"
      }
    }

    const { error: productError } = await supabase
      .from("product_images")
      .insert(
        images.map((img, i) => ({ 
          product_id: productId,
          image_path: img.image_path,
          width: img.width,
          height: img.height,
          position: i
        })
      ));

    if (productError) {
      return {
        success: false,
        error: productError.message
      };
    }
    return {
      success: true,
      data: { count: paths.length }
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Invalid content type"
      };
    }
    return {
      success: false,
      error: "Failed to prepare image upload"
    };
  }

}

// gets the logged in user, checks that the product id is valid and also belongs to the user
// also deleted from the join table
// deletes the product row from product table and returns the deleted product id
export async function deleteProduct(
  productId: number
): Promise<DataResponse<{ product_id: number }>> {
  try {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        error: "Invalid product id",
      };
    }

    const { data: existingProduct, error: ownershipError } = await supabase
      .from("user_products")
      .select("product_id")
      .eq("user_id", authData.user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (ownershipError) {
      return {
        success: false,
        error: ownershipError.message,
      };
    }

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found or unauthorized",
      };
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
      data: {
        product_id: productId,
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}

export interface BulkInsertProductsResponse {
  inserted: number;
  skipped: number;
}

export async function bulkInsertProducts(
  products: ParsedOpenAlexWork<ProductType>[]
): Promise<DataResponse<BulkInsertProductsResponse>> {
  try {
    const supabase = await createClient(); 
    const { data: authData } = await supabase.auth.getUser();

    if(!authData.user) { 
      return { success: false, error: "Authentication required" }
    }

    const parsedProducts = products.map((product) => parsedProductWorkSchema.parse(product));
    const rows: ProductInsertRow[] = parsedProducts.map((p) => {
      const links: ProductLink[] = [];

      if (p.doi) {
        const parsedDoi = doiSchema.safeParse(p.doi)
        if (parsedDoi.success) {
          links.push({
            url: `https://doi.org/${parsedDoi.data}`,
            kind: 'website',
            label: `DOI: ${parsedDoi.data}`,
          });
        }
      }

      if (p.pdfUrl) {
        links.push({ url: p.pdfUrl, kind: 'other', label: 'Full-Text PDF' });
      }

      return {
        workId: p.workId,
        title: p.title,
        contributors: p.authors,
        type: p.type,
        releaseDate: p.publicationDate,
        links,
        openAlexTopicIds: p.openAlexTopicIds ?? [],
      };
    });

    console.log(rows);

    const { data, error } = await supabase
      .rpc('bulk_import_user_products',
        { p_products: rows, p_user_id: authData.user.id }
      );

    if(error){ 
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    }

  } catch(err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message};
    }
    return { success: false, error: 'Failed to add products'};
  }

}