// src/lib/posts.ts
import { supabase } from "./supabase";

// Your existing blog post interfaces and functions...

// For user posts, use a type assertion approach
export async function createUserPost(content: string, title?: string) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to create a post");
    }

    // Use type assertion with 'any' to bypass TypeScript checking
    const { error } = await (supabase as any).from("posts").insert({
      user_id: userData.user.id,
      content,
      title,
    });

    if (error) {
      console.error("Error creating post:", error);
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err) {
    console.error("Error in createUserPost:", err);
    throw err;
  }
}

// Get all posts for the current user
export async function getUserPosts() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view your posts");
    }

    // Use type assertion with 'any' to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("posts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserPosts:", err);
    throw err;
  }
}
