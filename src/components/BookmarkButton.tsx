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

        // Add user_id filter to the query
        query = query.eq("user_id", user.id);

        // Execute the query without maybeSingle()
        const { data, error } = await query;

        if (error) {
          console.error("Error checking bookmark status:", error);
          throw error;
        }

        // Check if any bookmarks were found
        setIsBookmarked(data && data.length > 0);
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
        let query = (supabase as any).from("bookmarks").delete();

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (articleId) {
          query = query.eq("article_id", articleId);
        }

        const { error } = await query.eq("user_id", user.id);

        if (error) throw error;

        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await (supabase as any).from("bookmarks").insert({
          user_id: user.id,
          post_id: postId || null,
          article_id: articleId || null,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
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
