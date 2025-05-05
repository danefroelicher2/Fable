// src/lib/pinnedPostUtils.ts
import { supabase } from "./supabase";

/**
 * Manages pinned posts functionality.
 * Currently using localStorage as a workaround until a proper database table is created.
 *
 * Future implementation should use a pinned_posts table in Supabase with the following structure:
 * - id: uuid (primary key)
 * - user_id: uuid (references auth.users.id)
 * - article_id: uuid (references public_articles.id)
 * - pinned_at: timestamptz
 * - position: integer (to allow ordering of pinned posts)
 */

export interface PinnedPost {
  article_id: string;
  position: number;
}

/**
 * Get user's pinned posts (currently from localStorage)
 */
export function getUserPinnedPosts(userId: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedPinnedPosts = localStorage.getItem(`userPinnedPosts_${userId}`);
    if (savedPinnedPosts) {
      return JSON.parse(savedPinnedPosts);
    }
  } catch (error) {
    console.error("Error getting pinned posts:", error);
  }

  return [];
}

/**
 * Save user's pinned posts (currently to localStorage)
 */
export function saveUserPinnedPosts(
  userId: string,
  pinnedPosts: string[]
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(
      `userPinnedPosts_${userId}`,
      JSON.stringify(pinnedPosts)
    );
    return true;
  } catch (error) {
    console.error("Error saving pinned posts:", error);
    return false;
  }
}

/**
 * Check if an article is pinned
 */
export function isArticlePinned(userId: string, articleId: string): boolean {
  const pinnedPosts = getUserPinnedPosts(userId);
  return pinnedPosts.includes(articleId);
}

/**
 * Toggle article as pinned
 * Returns:
 * - true if operation was successful
 * - false if operation failed (e.g. maximum pins reached)
 */
export function togglePinnedPost(userId: string, articleId: string): boolean {
  const pinnedPosts = getUserPinnedPosts(userId);

  if (pinnedPosts.includes(articleId)) {
    // Remove from pinned posts
    const newPinnedPosts = pinnedPosts.filter((id) => id !== articleId);
    return saveUserPinnedPosts(userId, newPinnedPosts);
  } else {
    // Add to pinned posts (max 4)
    if (pinnedPosts.length >= 4) {
      return false; // Maximum reached
    }

    const newPinnedPosts = [...pinnedPosts, articleId];
    return saveUserPinnedPosts(userId, newPinnedPosts);
  }
}

/**
 * Reorder pinned posts
 */
export function reorderPinnedPosts(
  userId: string,
  pinnedPostIds: string[]
): boolean {
  // Only allow reordering if all IDs are already pinned
  const currentPinnedPosts = getUserPinnedPosts(userId);
  const allExist = pinnedPostIds.every((id) => currentPinnedPosts.includes(id));

  if (!allExist || pinnedPostIds.length > 4) {
    return false;
  }

  return saveUserPinnedPosts(userId, pinnedPostIds);
}
