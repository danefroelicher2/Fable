// src/components/PinnedPosts.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUserPinnedPosts, togglePinnedPost } from "@/lib/pinnedPostUtils";
import { useAuth } from "@/context/AuthContext";
import DeleteButton from "./DeleteButton";

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
  user_id: string;
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
          image_url,
          user_id
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

  // Handle article deletion
  const handleArticleDeleted = (articleId: string) => {
    // Remove the deleted article from the state
    setPinnedArticles(
      pinnedArticles.filter((article) => article.id !== articleId)
    );

    // Call the onUpdate callback if provided
    if (onUpdate) onUpdate();
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
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 dark:bg-gray-700 aspect-square rounded"
            ></div>
          ))}
        </div>
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {pinnedArticles.map((article) => (
        <div key={article.id} className="relative group">
          <Link
            href={`/articles/${article.slug}`}
            className="block bg-gray-100 rounded overflow-hidden hover:shadow-md transition-shadow relative"
          >
            {/* Square cover image */}
            <div className="aspect-square bg-gray-200 relative">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 p-2">
                  <span className="text-center text-sm">{article.title}</span>
                </div>
              )}
            </div>

            {/* Pinned Indicator */}
            <div className="absolute top-2 right-2 z-10">
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

            {/* Category tag if exists */}
            {article.category && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
            )}

            {/* Title and date below image */}
            <div className="p-3">
              <h3 className="text-gray-800 font-medium text-sm line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {formatDate(article.published_at)}
              </p>
            </div>
          </Link>

          {/* Bottom actions - only show for current user */}
          {isCurrentUser && (
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTogglePin(article.id);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Unpin
              </button>

              <DeleteButton
                articleId={article.id}
                onDelete={() => handleArticleDeleted(article.id)}
                className="text-xs"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
