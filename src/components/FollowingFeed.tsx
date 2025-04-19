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
    } else {
      setLoading(false);
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

      console.log(
        `Fetching following articles for user ${user.id}, page ${pageNum}`
      );

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
        console.log("User is not following anyone");
        setArticles([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Extract the user IDs the user is following
      const followingIds = followingData.map(
        (follow: { following_id: string }) => follow.following_id
      );
      console.log("Following IDs:", followingIds);

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

      console.log(
        `Found ${articlesData?.length || 0} articles from followed users`
      );

      // Determine if there are more articles to load
      setHasMore(articlesData?.length === articlesPerPage);

      // If loading more, append to existing articles
      if (pageNum > 1) {
        setArticles((prev) => [...prev, ...(articlesData || [])]);
      } else {
        setArticles(articlesData || []);
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

  // Get category label
  const getCategoryLabel = (categoryValue: string | null) => {
    const categories = [
      { value: "ancient-history", label: "Ancient History" },
      { value: "medieval-period", label: "Medieval Period" },
      { value: "renaissance", label: "Renaissance" },
      { value: "early-modern-period", label: "Early Modern Period" },
      { value: "industrial-age", label: "Industrial Age" },
      { value: "20th-century", label: "20th Century" },
      { value: "world-wars", label: "World Wars" },
      { value: "cold-war-era", label: "Cold War Era" },
      { value: "modern-history", label: "Modern History" },
    ];

    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.label : categoryValue || "Uncategorized";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-48 bg-slate-200"></div>
            <div className="p-4">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 mr-2"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            </div>
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
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/feed"
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Explore Community Feed
          </Link>
          <Link
            href="/search-users"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Find Users to Follow
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg shadow-md overflow-hidden article-card"
          >
            <div className="h-48 bg-slate-200 overflow-hidden">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <span className="text-center p-4">{article.title}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                  {article.title}
                </h2>
              </Link>

              <Link
                href={`/user/${article.user_id}`}
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
                <span className="text-sm text-gray-600 group-hover:text-blue-600">
                  {article.profiles?.full_name ||
                    article.profiles?.username ||
                    "Anonymous"}
                </span>
              </Link>

              <p className="text-gray-600 text-sm mb-2">
                {formatDate(article.published_at)}
              </p>

              <p className="text-gray-700 mb-3 line-clamp-3">
                {article.excerpt || "No excerpt available"}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {getCategoryLabel(article.category)}
                </span>

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
