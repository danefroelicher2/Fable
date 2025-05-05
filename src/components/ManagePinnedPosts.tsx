// src/components/ManagePinnedPosts.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getUserPinnedPosts,
  isArticlePinned,
  togglePinnedPost,
} from "@/lib/pinnedPostUtils";

interface Article {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  view_count: number;
  like_count?: number;
}

export default function ManagePinnedPosts() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserArticles();
    }
  }, [user]);

  const fetchUserArticles = async () => {
    try {
      setLoading(true);

      // Get pinned posts
      const pinnedPostIds = getUserPinnedPosts(user?.id || "");
      setPinnedCount(pinnedPostIds.length);

      // Fetch user's published articles
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id, 
          title, 
          slug, 
          published_at, 
          view_count
        `
        )
        .eq("user_id", user?.id)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Add like counts if possible
      let articlesWithData = [...(data || [])];

      try {
        // Try to get like counts for each article
        articlesWithData = await Promise.all(
          articlesWithData.map(async (article) => {
            try {
              const { count, error: likesError } = await (supabase as any)
                .from("likes")
                .select("id", { count: "exact", head: true })
                .eq("article_id", article.id);

              if (likesError) throw likesError;

              return {
                ...article,
                like_count: count || 0,
              };
            } catch (err) {
              console.warn(
                `Couldn't get like count for article ${article.id}:`,
                err
              );
              return {
                ...article,
                like_count: 0,
              };
            }
          })
        );
      } catch (err) {
        console.warn("Error getting like counts:", err);
      }

      setArticles(articlesWithData);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = (articleId: string) => {
    if (!user) return;

    // If currently not pinned and already at max pins, show error and return
    if (!isArticlePinned(user.id, articleId) && pinnedCount >= 4) {
      setMessage("You can only pin up to 4 articles.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const success = togglePinnedPost(user.id, articleId);
    if (success) {
      // Update the count
      const newCount = isArticlePinned(user.id, articleId)
        ? pinnedCount - 1
        : pinnedCount + 1;
      setPinnedCount(newCount);

      // Show success message
      setMessage(
        isArticlePinned(user.id, articleId)
          ? "Article unpinned successfully."
          : "Article pinned successfully."
      );
      setTimeout(() => setMessage(null), 3000);
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
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"
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

  if (articles.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">
          You haven't published any articles yet that can be pinned.
        </p>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
          {message}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600">
          Pin up to four articles to showcase them at the top of your profile.
          Currently pinned: <span className="font-bold">{pinnedCount}/4</span>
        </p>
      </div>

      <div className="divide-y">
        {articles.map((article) => {
          const isPinned = user && isArticlePinned(user.id, article.id);

          return (
            <div
              key={article.id}
              className="py-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <div className="flex text-sm text-gray-500 space-x-4">
                  <span>{formatDate(article.published_at)}</span>
                  <span>{article.view_count} views</span>
                  <span>{article.like_count || 0} likes</span>
                </div>
              </div>
              <button
                onClick={() => handleTogglePin(article.id)}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isPinned
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 ${
                    isPinned ? "text-blue-600" : "text-gray-600"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11.39 1.578a1 1 0 0 0-.78 0L2.5 5.5v9l8.11 3.922a1 1 0 0 0 .78 0L19.5 14.5v-9l-8.11-3.922z" />
                </svg>
                {isPinned ? "Pinned" : "Pin"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
