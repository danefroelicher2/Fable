// src/components/BookmarkButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface BookmarkButtonProps {
  postId?: string;
  articleId?: string;
  className?: string;
  color?: "light" | "dark";
}

export default function BookmarkButton({
  postId,
  articleId,
  className = "",
  color = "light",
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if the post/article is already bookmarked
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!user || (!postId && !articleId)) {
        setChecking(false);
        return;
      }

      try {
        setChecking(true);

        let query = (supabase as any).from("bookmarks").select("id");

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (articleId) {
          query = query.eq("article_id", articleId);
        }

        const { data, error } = await query
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking bookmark status:", error);
          throw error;
        }

        console.log("Bookmark check result:", data); // Debug output
        setIsBookmarked(!!data);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        setChecking(false);
      }
    }

    checkBookmarkStatus();
  }, [user, postId, articleId]);

  async function handleToggleBookmark() {
    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (loading || checking) return;

    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        console.log("Attempting to delete bookmark"); // Debug
        let query = (supabase as any).from("bookmarks").delete();

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (articleId) {
          query = query.eq("article_id", articleId);
        }

        const { error, data } = await query.eq("user_id", user.id);

        if (error) {
          console.error("Error deleting bookmark:", error);
          throw error;
        }

        console.log("Delete result:", data); // Debug
        setIsBookmarked(false);
      } else {
        // Add bookmark
        console.log(
          "Attempting to add bookmark for",
          postId ? `post: ${postId}` : `article: ${articleId}`
        );

        // Get the current user's JWT
        const { data: authData } = await (supabase as any).auth.getSession();
        const userId = authData?.session?.user?.id;

        if (!userId) {
          throw new Error("User ID not found in session");
        }

        const bookmarkData = {
          user_id: userId, // Using the ID directly from the auth session
          post_id: postId || null,
          article_id: articleId || null,
          created_at: new Date().toISOString(),
        };

        console.log("Bookmark data:", bookmarkData);

        const { error, data } = await (supabase as any)
          .from("bookmarks")
          .insert(bookmarkData)
          .select();

        if (error) {
          console.error("Error creating bookmark:", error);
          throw error;
        }

        console.log("Insert result:", data); // Debug
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Keep the UI state consistent if there's an error
      // (don't change isBookmarked if the operation failed)
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading || checking}
      className={`transition-colors focus:outline-none ${
        isBookmarked
          ? "text-yellow-500"
          : color === "light"
          ? "text-gray-600 hover:text-yellow-500"
          : "text-gray-400 hover:text-yellow-500"
      } ${
        loading || checking ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform ${
          isBookmarked ? "fill-current" : "fill-none stroke-current stroke-2"
        }`}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
