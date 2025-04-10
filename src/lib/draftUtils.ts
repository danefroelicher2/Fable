// src/lib/draftUtils.ts
import { supabase } from "./supabase";

export type Draft = {
  id?: string;
  user_id?: string;
  title: string | null;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Save a draft to the database
 * @param draft The draft to save
 * @returns The saved draft or null if there was an error
 */
export async function saveDraft(
  draft: Omit<Draft, "user_id" | "created_at" | "updated_at">
): Promise<Draft | null> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return null;
    }

    const draftWithUser = {
      ...draft,
      user_id: userData.user.id,
      updated_at: new Date().toISOString(),
    };

    // If we have an id, update the existing draft
    if (draft.id) {
      // Use any to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from("drafts")
        .update(draftWithUser)
        .eq("id", draft.id)
        .select();

      if (error) {
        console.error("Error updating draft:", error);
        return null;
      }

      return data?.[0] || null;
    }
    // Otherwise create a new draft
    else {
      // Use any to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from("drafts")
        .insert(draftWithUser)
        .select();

      if (error) {
        console.error("Error creating draft:", error);
        return null;
      }

      return data?.[0] || null;
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    return null;
  }
}

/**
 * Get all drafts for the current user
 * @returns An array of drafts or null if there was an error
 */
export async function getUserDrafts(): Promise<Draft[] | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return null;
    }

    // Use any to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("drafts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error getting drafts:", error);
      return null;
    }

    return data as Draft[];
  } catch (error) {
    console.error("Error getting drafts:", error);
    return null;
  }
}
/**
 * Get a specific draft by id
 * @param id The id of the draft to get
 * @returns The draft or null if there was an error
 */
export async function getDraftById(id: string): Promise<Draft | null> {
  try {
    // Use type assertion with 'any' to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("drafts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting draft:", error);
      return null;
    }

    return data as Draft;
  } catch (error) {
    console.error("Error getting draft:", error);
    return null;
  }
}

/**
 * Delete a draft
 * @param id The id of the draft to delete
 * @returns true if the draft was deleted, false otherwise
 */
export async function deleteDraft(id: string): Promise<boolean> {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return false;
    }

    // Use any to bypass TypeScript checking
    const { error } = await (supabase as any)
      .from("drafts")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.user.id); // Ensure user can only delete their own drafts

    if (error) {
      console.error("Error deleting draft:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting draft:", error);
    return false;
  }
}
