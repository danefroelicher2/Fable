"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserSearchBar from "@/components/UserSearchBar";
import { useTheme } from "@/context/ThemeContext";

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
  user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function SearchPage() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme(); // Add this line

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      setLoading(true);

      // Fetch the most recent articles
      const { data: articles, error } = await (supabase as any)
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
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(12);

      if (error) {
        throw error;
      }

      // If no articles found, return empty array
      if (!articles || articles.length === 0) {
        setRecentArticles([]);
        return;
      }

      const userIds = Array.from(
        new Set<string>(articles.map((article: Article) => article.user_id))
      );

      // Fetch profiles for all these users in a single query
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      // Create a map of user IDs to profiles for easy lookup
      const userProfileMap = profiles.reduce(
        (map: Record<string, any>, profile) => {
          map[profile.id] = profile;
          return map;
        },
        {}
      );

      // Join the articles with their user profiles
      const articlesWithUsers = articles.map((article: any) => ({
        ...article,
        user: userProfileMap[article.user_id] || null,
      }));

      setRecentArticles(articlesWithUsers);
    } catch (err: any) {
      console.error("Error fetching recent articles:", err);
      setError(err.message || "Failed to load recent articles");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Main Search Section */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h1
            className="text-3xl font-bold mb-6"
            style={{ color: theme === "dark" ? "black" : "inherit" }}
          >
            Search
          </h1>

          {/* User Search Bar */}
          <div className="mb-8">
            <UserSearchBar />
          </div>
        </div>

        {/* Explore Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: theme === "dark" ? "black" : "inherit" }}
          >
            Explore Recent Articles
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-lg p-4 animate-pulse h-64"
                >
                  <div className="bg-gray-200 h-32 mb-4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              <p>Error loading articles: {error}</p>
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/articles/${article.slug}`}>
                    <div className="bg-gray-200 relative overflow-hidden">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-auto"
                          style={{ maxHeight: "12rem", minHeight: "8rem" }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 overflow-hidden flex items-center justify-center">
                          {article.user?.avatar_url ? (
                            <img
                              src={article.user.avatar_url}
                              alt={article.user.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-medium text-sm">
                              {(
                                article.user?.username ||
                                article.user?.full_name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {article.user?.full_name ||
                            article.user?.username ||
                            "Anonymous"}
                        </span>
                      </div>

                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{formatDate(article.published_at)}</span>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {article.view_count || 0}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && recentArticles.length > 0 && (
            <div className="mt-8 text-center"></div>
          )}
        </div>
      </div>
    </div>
  );
}
