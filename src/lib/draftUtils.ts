// src/lib/draftUtils.ts
import { supabase } from "./supabase";

export type Draft = {
  id?: string;
  user_id?: string;
  title: string | null;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  slug?: string | null;
  image_url?: string | null; // Added image_url to the type
  is_published?: boolean; // Added to track publication status
  published_id?: string; // Reference to the published article ID
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
        .insert({
          ...draftWithUser,
          is_published: false, // Ensure new drafts are not marked as published
        })
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
      .eq("is_published", false) // Only get unpublished drafts
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
    // Use any to bypass TypeScript checking
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
    // Use any to bypass TypeScript checking
    const { error } = await (supabase as any)
      .from("drafts")
      .delete()
      .eq("id", id);

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

/**
 * Mark a draft as published and save the published article ID
 * @param draftId The ID of the draft that was published
 * @param publishedId The ID of the published article
 * @returns Whether the operation was successful
 */
export async function markDraftAsPublished(
  draftId: string,
  publishedId: string
): Promise<boolean> {
  try {
    // Update the draft to mark it as published
    const { error } = await (supabase as any)
      .from("drafts")
      .update({
        is_published: true,
        published_id: publishedId,
      })
      .eq("id", draftId);

    if (error) {
      console.error("Error marking draft as published:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking draft as published:", error);
    return false;
  }
}

/**
 * Publish a draft directly to public_articles
 * @param draft The draft to publish
 * @returns The ID of the published article or null if there was an error
 */
export async function publishDraft(draft: Draft): Promise<string | null> {
  try {
    if (!draft.id) {
      console.error("Draft ID is required for publishing");
      return null;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return null;
    }

    // Generate a URL-friendly slug from the title if not provided
    const finalSlug =
      draft.slug ||
      draft.title
        ?.toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-") +
        "-" +
        Date.now().toString().slice(-6);

    // Use excerpt or generate one from content if not provided
    const finalExcerpt =
      draft.excerpt ||
      (draft.content && draft.content.length > 150
        ? draft.content.substring(0, 150) + "..."
        : draft.content);

    // Insert into public_articles
    // Line breaks are preserved because we're directly storing the content string
    // No processing or transformation is done to the content
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .insert({
        user_id: userData.user.id,
        title: draft.title,
        content: draft.content, // Raw content with line breaks is preserved
        excerpt: finalExcerpt,
        category: draft.category,
        slug: finalSlug,
        is_published: true,
        published_at: new Date().toISOString(),
        view_count: 0,
        image_url: draft.image_url || null,
      })
      .select();

    if (error) {
      console.error("Error publishing draft:", error);
      return null;
    }

    // If successful, mark the draft as published
    if (data && data[0] && data[0].id) {
      const publishedId = data[0].id;
      await markDraftAsPublished(draft.id, publishedId);
      return publishedId;
    }

    return null;
  } catch (error) {
    console.error("Error publishing draft:", error);
    return null;
  }
}
