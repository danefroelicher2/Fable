"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

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

export default function UserArticlesPage() {
  const params = useParams();
  const router = useRouter();

  // Type assertion to ensure userId is a string
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState("");
  const [displayType, setDisplayType] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Add a guard to ensure userId is a valid string
    if (userId && typeof userId === "string") {
      fetchProfile();
      fetchArticles();
    } else {
      router.push("/not-found");
    }
  }, [userId, router]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load user profile");
    }
  }

  async function fetchArticles() {
    try {
      setLoading(true);

      // Get count of total articles
      const { count, error: countError } = await (supabase as any)
        .from("public_articles")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_published", true);

      if (countError) throw countError;
      setTotalArticles(count || 0);

      // Fetch articles
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
        .eq("user_id", userId)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      // For each article, get the like count
      const articlesWithLikes = await Promise.all(
        (data || []).map(async (article: Article) => {
          try {
            const { count, error: likesError } = await (supabase as any)
              .from("likes")
              .select("id", { count: "exact" })
              .eq("article_id", article.id);

            if (likesError) throw likesError;

            return {
              ...article,
              like_count: count || 0,
            };
          } catch (err) {
            console.error("Error fetching like count:", err);
            return {
              ...article,
              like_count: 0,
            };
          }
        })
      );

      setArticles(articlesWithLikes);
    } catch (err) {
      console.error("Error fetching user articles:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User Header */}
      {profile && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center">
            <Link href={`/user/${profile.id}`} className="mr-6">
              <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">
                    {(profile.username || profile.full_name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div>
              <Link href={`/user/${profile.id}`}>
                <h1 className="text-2xl font-bold hover:text-blue-600">
                  {profile.full_name || profile.username || "Anonymous User"}
                </h1>
              </Link>
              {profile.username && (
                <p className="text-gray-600">@{profile.username}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Articles Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Published Articles</h2>
            <p className="text-gray-600">Total: {totalArticles}</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setDisplayType("grid")}
              className={`p-2 rounded ${
                displayType === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              aria-label="Grid view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setDisplayType("list")}
              className={`p-2 rounded ${
                displayType === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              aria-label="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {displayType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="h-48 bg-slate-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              This user hasn't published any articles yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        ) : displayType === "grid" ? (
          // Grid display (Instagram-style)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-slate-200 relative">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 p-4">
                      <p className="text-center font-medium line-clamp-3">
                        {article.title}
                      </p>
                    </div>
                  )}

                  {article.category && (
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs">
                      {article.category}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1 text-lg line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{formatDate(article.published_at)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
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
                        {article.view_count}
                      </span>
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {article.like_count || 0}
                      </span>
                    </div>
                  </div>
                  {article.excerpt && (
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // List display
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="md:flex">
                  {article.image_url && (
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-full bg-slate-200">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-6 ${
                      article.image_url ? "md:w-2/3" : "w-full"
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>{formatDate(article.published_at)}</span>
                      <div className="flex space-x-3">
                        <span className="flex items-center">
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
                          {article.view_count}
                        </span>
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {article.like_count || 0}
                        </span>
                      </div>
                    </div>
                    {article.excerpt && (
                      <p className="text-gray-700">{article.excerpt}</p>
                    )}
                    <div className="mt-4">
                      {article.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {article.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
