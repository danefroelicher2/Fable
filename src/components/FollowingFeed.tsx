// src/components/FollowingFeed.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
  user_id: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function FollowingFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const articlesPerPage = 6;

  useEffect(() => {
    if (user) {
      fetchFollowingArticles(1);
    }
  }, [user]);

  async function fetchFollowingArticles(pageNum: number) {
    try {
      if (!user) {
        // If not logged in, don't try to fetch
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // First get list of users the current user follows
      const { data: followingData, error: followingError } = await (
        supabase as any
      )
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;

      // If not following anyone, show empty state
      if (!followingData || followingData.length === 0) {
        setArticles([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Extract the user IDs the user is following
      const followingIds = followingData.map(
        (follow: { following_id: string }) => follow.following_id
      );

      // Fetch articles from followed users with pagination
      const from = (pageNum - 1) * articlesPerPage;
      const to = from + articlesPerPage - 1;

      const { data: articlesData, error: articlesError } = await (
        supabase as any
      )
        .from("public_articles")
        .select(
          `
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `
        )
        .in("user_id", followingIds)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (articlesError) throw articlesError;

      // Determine if there are more articles to load
      setHasMore(articlesData.length === articlesPerPage);

      // If loading more, append to existing articles
      if (pageNum > 1) {
        setArticles((prev) => [...prev, ...articlesData]);
      } else {
        setArticles(articlesData);
      }

      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching following articles:", err);
      setError("Failed to load articles from people you follow");
    } finally {
      setLoading(false);
    }
  }

  function loadMore() {
    if (hasMore && !loading) {
      fetchFollowingArticles(page + 1);
    }
  }

  // Format date (e.g., "Mar 15, 2024")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          See articles from people you follow
        </h2>
        <p className="text-gray-600 mb-6">
          Sign in to see articles from people you follow
        </p>
        <Link
          href="/signin"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading && articles.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
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
      <div className="text-center py-10 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Your Following Feed is Empty
        </h2>
        <p className="text-gray-600 mb-6">
          Follow other users to see their articles here
        </p>
        <Link
          href="/feed"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Explore Community Articles
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Articles from People You Follow
      </h2>

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg shadow-md overflow-hidden article-card"
          >
            <div className="p-4">
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                  {article.title}
                </h2>
              </Link>

              <Link
                href={`/user/${article.profiles?.id}`}
                className="flex items-center mb-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2 overflow-hidden">
                  {article.profiles?.avatar_url ? (
                    <img
                      src={article.profiles.avatar_url}
                      alt={article.profiles.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {(
                        article.profiles?.username?.charAt(0) ||
                        article.profiles?.full_name?.charAt(0) ||
                        "U"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700 group-hover:text-blue-600">
                  By{" "}
                  {article.profiles?.full_name ||
                    article.profiles?.username ||
                    "Anonymous User"}
                </div>
              </Link>

              <p className="text-gray-600 text-sm mb-3">
                {formatDate(article.published_at)}
              </p>

              <p className="text-gray-700 mb-4">
                {article.excerpt || article.title}
              </p>

              <div className="flex justify-between items-center">
                {article.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {article.category}
                  </span>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {article.view_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
