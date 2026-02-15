"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getUserPosts } from "@/lib/actions/data";
import type { User } from "@/lib/types/feed";
import { createClient } from "@/supabase/server";
import type { DataResponse } from "../types/data";

export async function getUserFollowers(
  user_id: string,
  supabaseClient?: SupabaseClient,
): Promise<DataResponse<User[]>> {
  try {
    const supabase = supabaseClient || (await createClient());

    const { data, error } = await supabase
      .from("follows")
      .select(`
    users:follower_id (
      user_id,
      first_name,
      last_name,
      email
    )
  `)
      .eq("following_id", user_id)
      .overrideTypes<User[]>();

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: true,
      data:
        (data as unknown as { users: User }[])
          .map((row) => row.users)
          .filter(Boolean) || [],
    };
  } catch (error) {
    console.error(`error in getfollowers ${error}`);
  }

  return {
    success: false,
    error: `Failed to get user followers`,
  };
}

export async function getUserFollowing(
  user_id: string,
  supabaseClient?: SupabaseClient,
): Promise<DataResponse<User[]>> {
  const supabase = supabaseClient || (await createClient());
  try {
    const { data, error } = await supabase
      .from("follows")
      .select(`
    users:following_id (
      user_id,
      first_name,
      last_name,
      email
    )
  `)
      .eq("follower_id", user_id)
      .overrideTypes<User[]>();

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: true,
      data:
        (data as unknown as { users: User }[])
          .map((row) => row.users)
          .filter(Boolean) || [],
    };
  } catch (error) {
    console.error(`error in getfollowers ${error}`);
  }

  return {
    success: false,
    error: `Failed to get user followers`,
  };
}
