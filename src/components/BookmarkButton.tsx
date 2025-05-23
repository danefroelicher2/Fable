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
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  // Add this prop to prevent navigation when needed
  preventNavigation?: boolean;
}

export default function BookmarkButton({
  postId,
  articleId,
  className = "",
  color = "light",
  size = "md",
  showText = false,
  preventNavigation = false,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if the post/article is already bookmarked
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function checkBookmarkStatus() {
      if (!user || (!postId && !articleId)) {
        if (isMounted) {
          setChecking(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setChecking(true);
        }

        console.log("Checking bookmark status for:", {
          postId,
          articleId,
          userId: user.id,
        });

        let query = (supabase as any).from("bookmarks").select("id");

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (articleId) {
          query = query.eq("article_id", articleId);
        }

        // Add user_id filter to the query
        query = query.eq("user_id", user.id);

        // Execute the query
        const { data, error } = await query;

        if (error) {
          console.error("Error checking bookmark status:", error);
          throw error;
        }

        console.log("Bookmark check result:", {
          data,
          hasBookmarks: data && data.length > 0,
        });

        // Check if any bookmarks were found
        if (isMounted) {
          setIsBookmarked(data && data.length > 0);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }

    checkBookmarkStatus();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user, postId, articleId]);

  async function handleToggleBookmark(event: React.MouseEvent) {
    // CRITICAL: Stop event propagation to prevent any parent click handlers
    event.preventDefault();
    event.stopPropagation();

    console.log("Bookmark button clicked:", {
      postId,
      articleId,
      isBookmarked,
    });

    if (!user) {
      // Only navigate if preventNavigation is false
      if (!preventNavigation) {
        router.push(
          `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
        );
      }
      return;
    }

    if (loading || checking) {
      console.log("Bookmark operation already in progress, skipping");
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        console.log("Removing bookmark...");
        // Remove bookmark
        let query = (supabase as any).from("bookmarks").delete();

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (articleId) {
          query = query.eq("article_id", articleId);
        }

        const { error } = await query.eq("user_id", user.id);

        if (error) {
          console.error("Error removing bookmark:", error);
          throw error;
        }

        console.log("Bookmark removed successfully");
        setIsBookmarked(false);
      } else {
        console.log("Adding bookmark...");
        // Add bookmark
        const bookmarkData = {
          user_id: user.id,
          post_id: postId || null,
          article_id: articleId || null,
          created_at: new Date().toISOString(),
        };

        console.log("Inserting bookmark data:", bookmarkData);

        const { error } = await (supabase as any)
          .from("bookmarks")
          .insert(bookmarkData);

        if (error) {
          console.error("Error adding bookmark:", error);
          throw error;
        }

        console.log("Bookmark added successfully");
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // You might want to show a toast notification here instead of alert
      if (typeof window !== "undefined") {
        alert("Failed to update bookmark. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Size classes for the icon
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading || checking}
      className={`flex items-center transition-colors focus:outline-none ${
        isBookmarked
          ? "text-yellow-500"
          : color === "light"
          ? "text-gray-600 hover:text-yellow-500"
          : "text-gray-400 hover:text-yellow-500"
      } ${
        loading || checking ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      type="button" // Explicitly set button type to prevent form submission
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} transition-transform ${
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

      {showText && (
        <span className="ml-2 text-sm">
          {loading ? "..." : isBookmarked ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
