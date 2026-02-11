"use server";

import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { createClient } from "@/supabase/server";

/**
 * Server action: signs in the user with email and password. Validates with loginSchema, then calls Supabase signInWithPassword.
 * @param formData - Form data containing "email" and "password"
 * @returns Promise of { success: true, data } or { success: false, error: string }
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Validate with Zod schema
  try {
    const parsed = loginSchema.parse({ email, password });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.email.toLowerCase(),
      password: parsed.password,
    });


    if (error) {
      console.error("Error signing in: ", error);
      return {
        success: false,
        error: error.message ?? "Invalid email or password",
      };
    }
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Invalid input" };
  }
}

/**
 * Server action: creates a new account with email and password. Validates with signupSchema, then calls Supabase signUp.
 * @param formData - Form data containing "email", "password", "confirmPassword", "firstName", "lastName"
 * @returns Promise of { success: true, data } or { success: false, error: string }
 */
export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const supabase = await createClient();

  // Validate with Zod schema
  try {
    const parsed = signupSchema.parse({
      email,
      password,
      confirmPassword: confirmPassword,
      firstName,
      lastName,
    });

    const { data, error } = await supabase.auth.signUp({
      email: parsed.email.toLowerCase(),
      password: parsed.password,
    });

    if (error) {
      console.error("Error signing up: ", error);
      return {
        success: false,
        error: error.message ?? "Failed to create account",
      };
    }
    
    // Wait for user authentication to complete and verify user ID exists
    if (!data.user?.id) {
      return {
        success: false,
        error: "Authentication failed - no user ID generated",
      };
    }

    // Insert user data into Users table with the authenticated user's ID
    const { error: userInsertError } = await supabase
      .from("Users")
      .insert([
        {
          user_id: data.user.id,
          email: parsed.email.toLowerCase(),
          first_name: parsed.firstName,
          last_name: parsed.lastName,
        },
      ]);

    if (userInsertError) {
      console.error("Error inserting user: ", userInsertError);
      return {
        success: false,
        error: "Failed to create user",
      };
    }

    // Insert profile with the authenticated user's ID
    const { error: profileInsertError } = await supabase
      .from("Profile")
      .insert([
        {
          user_id: data.user.id,
          first_name: parsed.firstName,
          last_name: parsed.lastName,
        },
      ]);

    if (profileInsertError) {
      console.error("Error inserting profile: ", profileInsertError);
      return {
        success: false,
        error: "Failed to create profile",
      };
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Invalid input" };
  }
}
