// src/components/UserPublishedArticles.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

interface UserPublishedArticlesProps {
  userId: string;
  displayType?: "grid" | "list";
  limit?: number;
  showViewAll?: boolean;
}

export default function UserPublishedArticles({
  userId,
  displayType = "grid",
  limit = 6,
  showViewAll = true,
}: UserPublishedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserArticles();
    }
  }, [userId]);

  async function fetchUserArticles() {
    try {
      setLoading(true);

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
        .order("published_at", { ascending: false })
        .limit(limit);

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

  if (loading) {
    return (
      <div className="animate-pulse">
        {displayType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, index) => (
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
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        )}
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
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">
          This user hasn't published any articles yet.
        </p>
        <Link
          href="/write"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Write Your First Article
        </Link>
      </div>
    );
  }

  // Instagram-style Grid Display
  if (displayType === "grid") {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block aspect-square bg-gray-100 relative overflow-hidden group"
            >
              {/* Square Article Thumbnail */}
              <div className="w-full h-full bg-slate-200 relative">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 p-4">
                    <p className="text-center font-medium">{article.title}</p>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                  <h3 className="font-bold text-center mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <div className="flex items-center space-x-3 mt-2">
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
              </div>
            </Link>
          ))}
        </div>

        {showViewAll && articles.length >= limit && (
          <div className="text-center mt-8">
            <Link
              href={`/user/${userId}/articles`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition"
            >
              View All Articles
            </Link>
          </div>
        )}
      </div>
    );
  }

  // List display
  return (
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
            <div className={`p-6 ${article.image_url ? "md:w-2/3" : "w-full"}`}>
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

      {showViewAll && articles.length >= limit && (
        <div className="text-center mt-6">
          <Link
            href={`/user/${userId}/articles`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Articles →
          </Link>
        </div>
      )}
    </div>
  );
}
