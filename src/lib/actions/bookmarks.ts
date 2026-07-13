'use server';
import { createClient } from "@/supabase/server";
import z from "zod";
import { DataResponse } from "../types/data";

export async function setSavedPost(postId: string, save: boolean): Promise<DataResponse<void>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    if (save) {
      const { error } = await supabase
        .from("saved_posts")
        .upsert(
          { profile_user_id: authData.user.id, post_id: parseInt(postId) },
          { onConflict: "profile_user_id,post_id", ignoreDuplicates: true }
        );
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
    else {
      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("profile_user_id", authData.user.id)
        .eq("post_id", parseInt(postId));
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid post id" };
    }
    console.error("setSavePost failed:", error)
    return {
      success: false,
      error: "Failed to set save status of post"
    };
  }
}

export async function setSavedPublication(
  publicationId: number, save: boolean
): Promise<DataResponse<void>> {
  try {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authenication required"
      }
    }

    if (!Number.isInteger(publicationId) || publicationId <= 0) {
      return {
        success: false,
        error: "Invalid publication id"
      };
    }

    if (save) {
      const { error } = await supabase
        .from("saved_publications")
        .upsert(
          { profile_user_id: authData.user.id, publication_id: publicationId },
          { onConflict: "profile_user_id,publication_id", ignoreDuplicates: true }
        );

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }
    }
    else {
      const { error } = await supabase
        .from("saved_publications")
        .delete()
        .eq("profile_user_id", authData.user.id)
        .eq("publication_id", publicationId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true
    }
  } catch {
    return {
      success: false,
      error: "Failed to save publication"
    };
  }
}

export async function setSavedProduct(
  productId: number, save: boolean
): Promise<DataResponse<void>> {
  try {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authenication required"
      }
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        error: "Invalid product id"
      };
    }

    if (save) {
      const { error } = await supabase
        .from("saved_products")
        .upsert(
          { profile_user_id: authData.user.id, product_id: productId },
          { onConflict: "profile_user_id,product_id", ignoreDuplicates: true }
        );

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }
    }
    else {
      const { error } = await supabase
        .from("saved_products")
        .delete()
        .eq("profile_user_id", authData.user.id)
        .eq("product_id", productId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true
    }
  } catch {
    return {
      success: false,
      error: "Failed to save product"
    };
  }
}

export async function setSavedJob(
  jobId: number, save: boolean
): Promise<DataResponse<void>> {
  try {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authenication required"
      }
    }

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return {
        success: false,
        error: "Invalid job id"
      };
    }

    if (save) {
      const { error } = await supabase
        .from("saved_jobs")
        .upsert(
          { profile_user_id: authData.user.id, job_id: jobId },
          { onConflict: "profile_user_id,job_id", ignoreDuplicates: true }
        );

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }
    }
    else {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("profile_user_id", authData.user.id)
        .eq("job_id", jobId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true
    }
  } catch {
    return {
      success: false,
      error: "Failed to save job"
    };
  }
}