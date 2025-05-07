// src/lib/supabase.ts
"use client";

import { createClient } from "@supabase/supabase-js";
// Use type definition without path alias to avoid import errors
import type { Database } from "../types/supabase";

// These environment variables need to be defined in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log an error if environment variables are missing, but don't throw
// This allows the app to still function and show appropriate error messages
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder-url.supabase.co", // Fallback to prevent runtime errors
  supabaseKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "history-blog-auth-storage", // Add a specific storage key
    },
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseKey;
};

/**
 * Check if a username is already taken by another user
 * @param username The username to check
 * @param currentUserId The current user's ID (to exclude from the check)
 * @returns true if the username is available, false if taken
 */
export async function isUsernameAvailable(
  username: string,
  currentUserId: string
): Promise<boolean> {
  try {
    // Don't check empty usernames
    if (!username.trim()) return true;

    // Always convert to lowercase for checking to enforce case-insensitive uniqueness
    const lowercaseUsername = username.trim().toLowerCase();

    // Query for users with this username, excluding current user
    // Use ilike for case-insensitive matching
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", lowercaseUsername)
      .neq("id", currentUserId)
      .limit(1);

    if (error) throw error;

    // Log for debugging
    console.log(
      `Username check: "${lowercaseUsername}" - Available: ${data.length === 0}`
    );

    // Username is available if no results found
    return data.length === 0;
  } catch (error) {
    console.error("Error checking username availability:", error);
    // In case of error, conservatively return false
    return false;
  }
}
