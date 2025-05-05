// src/components/PinnedPosts.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUserPinnedPosts, togglePinnedPost } from "@/lib/pinnedPostUtils";
import { useAuth } from "@/context/AuthContext";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string;
  view_count: number;
  image_url?: string | null;
  like_count?: number;
}

interface PinnedPostsProps {
  userId: string;
  isCurrentUser?: boolean;
  onUpdate?: () => void;
}

export default function PinnedPosts({
  userId,
  isCurrentUser = false,
  onUpdate,
}: PinnedPostsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pinnedArticles, setPinnedArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPinnedArticles();
  }, [userId]);

  async function fetchPinnedArticles() {
    try {
      setLoading(true);

      // Get pinned post IDs from localStorage
      const pinnedPostIds = getUserPinnedPosts(userId);

      if (pinnedPostIds.length === 0) {
        setPinnedArticles([]);
        return;
      }

      // Fetch the actual articles
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id, 
          title, 
          slug, 
          excerpt, 
          category, 
          published_at, 
          view_count,
          image_url
        `
        )
        .in("id", pinnedPostIds)
        .eq("user_id", userId)
        .eq("is_published", true);

      if (error) throw error;

      // Sort according to pinned order
      const sortedArticles = [...(data || [])].sort((a, b) => {
        const indexA = pinnedPostIds.indexOf(a.id);
        const indexB = pinnedPostIds.indexOf(b.id);
        return indexA - indexB;
      });

      setPinnedArticles(sortedArticles);
    } catch (err) {
      console.error("Error fetching pinned articles:", err);
      setError("Failed to load pinned articles");
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePin = async (articleId: string) => {
    if (!user || user.id !== userId) return;

    const success = togglePinnedPost(userId, articleId);
    if (success) {
      await fetchPinnedArticles();
      if (onUpdate) onUpdate();
    }
  };

  // Format date (e.g., "Mar 15, 2024")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(Math.min(4, 2))].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (pinnedArticles.length === 0) {
    if (isCurrentUser) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            You haven't pinned any articles yet. Pin up to four of your favorite
            posts to highlight them on your profile.
          </p>
        </div>
      );
    }
    return null; // Don't show anything if not current user and no pins
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pinnedArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group"
          >
            {/* Pin indicator */}
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11.39 1.578a1 1 0 0 0-.78 0L2.5 5.5v9l8.11 3.922a1 1 0 0 0 .78 0L19.5 14.5v-9l-8.11-3.922z" />
                </svg>
                <span>Pinned</span>
              </div>
            </div>

            {article.image_url ? (
              <div className="h-32 bg-gray-200 dark:bg-gray-700">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white">
                <div className="text-center p-4">
                  <span className="text-lg font-bold">
                    {article.category || "Article"}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4">
              <h3 className="text-lg font-bold mb-1 line-clamp-2">
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {article.title}
                </Link>
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {formatDate(article.published_at)}
              </div>
              {article.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}

              {/* Pin/Unpin button for current user */}
              {isCurrentUser && (
                <button
                  onClick={() => handleTogglePin(article.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11.39 1.578a1 1 0 0 0-.78 0L2.5 5.5v9l8.11 3.922a1 1 0 0 0 .78 0L19.5 14.5v-9l-8.11-3.922z" />
                  </svg>
                  Unpin Article
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
