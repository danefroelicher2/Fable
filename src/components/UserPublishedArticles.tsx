// src/components/UserPublishedArticles.tsx
// Updated to include ShareButton functionality

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUserPinnedPosts } from "@/lib/pinnedPostUtils";
import { useAuth } from "@/context/AuthContext";
import DeleteButton from "./DeleteButton";
import ShareButton from "./ShareButton";
import Image from "next/image";

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

interface UserPublishedArticlesProps {
  userId: string;
  limit?: number;
  showViewAll?: boolean;
  displayType?: "grid" | "list";
}

export default function UserPublishedArticles({
  userId,
  limit = 9,
  showViewAll = true,
  displayType = "grid",
}: UserPublishedArticlesProps) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalArticles, setTotalArticles] = useState(0);
  const isCurrentUser = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchUserArticles();
    } else {
      console.warn("No userId provided to UserPublishedArticles");
      setLoading(false);
    }
  }, [userId, limit]);

  async function fetchUserArticles() {
    try {
      setLoading(true);
      console.log("Fetching articles for user:", userId);

      // Get pinned post IDs to exclude from regular articles
      let pinnedPostIds: string[] = [];
      try {
        pinnedPostIds =
          typeof getUserPinnedPosts === "function"
            ? getUserPinnedPosts(userId)
            : [];
        console.log("Excluding pinned posts:", pinnedPostIds);
      } catch (pinError) {
        console.warn("Error getting pinned posts:", pinError);
        pinnedPostIds = [];
      }

      // Fetch total count first
      try {
        const { count, error: countError } = await (supabase as any)
          .from("public_articles")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_published", true);

        if (countError) {
          console.error("Count error:", countError);
          throw countError;
        }

        setTotalArticles(count || 0);
      } catch (countErr) {
        console.error("Error fetching article count:", countErr);
      }

      // Fetch articles
      let query = (supabase as any)
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
        .eq("user_id", userId)
        .eq("is_published", true);

      // Filter out pinned posts
      if (pinnedPostIds && pinnedPostIds.length > 0) {
        try {
          for (const pinnedId of pinnedPostIds) {
            query = query.neq("id", pinnedId);
          }
        } catch (filterErr) {
          console.warn("Error applying pinned post filter:", filterErr);
        }
      }

      const { data, error } = await query
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Article fetch error:", error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} articles`);

      // Process articles to add like counts
      let processedArticles = data || [];

      try {
        processedArticles = processedArticles.map((article: Article) => ({
          ...article,
          like_count: 0,
        }));

        if (processedArticles.length > 0) {
          processedArticles = await Promise.all(
            processedArticles.map(async (article: Article) => {
              try {
                const { count: likeCount, error: likesError } = await (
                  supabase as any
                )
                  .from("likes")
                  .select("id", { count: "exact" })
                  .eq("article_id", article.id);

                if (likesError) {
                  console.warn(
                    `Like count error for article ${article.id}:`,
                    likesError
                  );
                  return article;
                }

                return {
                  ...article,
                  like_count: likeCount || 0,
                };
              } catch (err) {
                console.warn(
                  `Couldn't get like count for article ${article.id}:`,
                  err
                );
                return article;
              }
            })
          );
        }
      } catch (err) {
        console.warn("Error getting like counts:", err);
      }

      setArticles(processedArticles);
    } catch (err) {
      console.error("Error fetching user articles:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }

  const handleArticleDeleted = (articleId: string) => {
    setArticles(articles.filter((article) => article.id !== articleId));
    setTotalArticles((prev) => Math.max(0, prev - 1));
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      console.warn("Date formatting error:", err);
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {displayType === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(limit)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 dark:bg-gray-700 h-40 rounded"
              ></div>
            ))}
          </div>
        ) : (
          [...Array(limit)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ))
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
        <p className="text-gray-600">No published articles to display.</p>
      </div>
    );
  }

  return (
    <div>
      {displayType === "grid" ? (
        // Grid display with share buttons
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {articles.map((article) => (
            <div key={article.id} className="relative group">
              <Link
                href={`/articles/${article.slug}`}
                className="block bg-gray-100 rounded overflow-hidden hover:shadow-md transition-shadow h-full"
              >
                {/* Square cover image */}
                <div className="aspect-square bg-gray-200 relative">
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 p-2">
                      <span className="text-center text-sm">
                        {article.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and metadata below image */}
                <div className="p-3">
                  <h3 className="text-gray-800 font-medium text-sm line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-500 text-xs">
                      {formatDate(article.published_at)}
                    </p>
                    <div className="text-gray-500 text-xs flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
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
                    </div>
                  </div>
                </div>
              </Link>

              {/* Action buttons overlay - UPDATED WITH SHARE BUTTON */}
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 py-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-2">
                {/* Share Button - NEW */}
                <ShareButton
                  articleId={article.id}
                  articleSlug={article.slug}
                  title={article.title}
                  size="sm"
                  className="flex-shrink-0"
                />

                {/* Delete button - only for current user */}
                {isCurrentUser && (
                  <DeleteButton
                    articleId={article.id}
                    onDelete={() => handleArticleDeleted(article.id)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List display with share buttons
        <div className="space-y-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden relative group"
            >
              <div className="md:flex">
                {article.image_url && (
                  <div className="md:w-1/3">
                    <div className="h-48 md:h-full bg-slate-200 relative">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`p-6 ${article.image_url ? "md:w-2/3" : "w-full"}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2 flex-1">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    {/* Action buttons - UPDATED WITH SHARE */}
                    <div className="flex items-center space-x-2 ml-4">
                      <ShareButton
                        articleId={article.id}
                        articleSlug={article.slug}
                        title={article.title}
                        size="md"
                      />
                      {isCurrentUser && (
                        <DeleteButton
                          articleId={article.id}
                          onDelete={() => handleArticleDeleted(article.id)}
                        />
                      )}
                    </div>
                  </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewAll && totalArticles > limit && (
        <div className="text-right mt-6">
          <Link
            href={`/user/${userId}/articles`}
            className="font-bold"
            style={{ color: "black" }}
          >
            View All Articles ({totalArticles})
          </Link>
        </div>
      )}
    </div>
  );
}
