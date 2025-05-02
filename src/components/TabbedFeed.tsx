// src/components/TabbedFeed.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import FollowingFeed from "@/components/FollowingFeed";

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

export default function TabbedFeed() {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === "forYou") {
      fetchArticles();
    }
  }, [activeTab, selectedCategory]);

  async function fetchArticles() {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log("Fetching articles with category:", selectedCategory);

      // Step 1: Check if the public_articles table exists and use type assertion to bypass type checking
      try {
        // First, let's test a simple query to see if the table exists
        const { data: testData, error: testError } = await (supabase as any)
          .from("public_articles")
          .select("id")
          .limit(1);

        if (testError) {
          console.error("Error testing table access:", testError);
          throw new Error(`Table access error: ${testError.message}`);
        }

        console.log("Table access test successful:", testData);
      } catch (testErr) {
        console.error("Table test failed:", testErr);
        setError("Cannot access articles. Database table may not exist.");
        setLoading(false);
        return;
      }

      // Step 2: Try fetching with a simpler query first
      // Use type assertion (as any) to bypass TypeScript issues
      let query = (supabase as any)
        .from("public_articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data: articlesOnly, error: articlesError } = await query;

      if (articlesError) {
        console.error("Error fetching basic articles:", articlesError);
        throw articlesError;
      }

      console.log(
        "Basic articles fetched successfully:",
        articlesOnly?.length || 0
      );

      // Step 3: Now try to fetch profiles for each article
      const articlesWithProfiles = [];

      for (const article of articlesOnly || []) {
        try {
          // Fetch the profile for this article - use type assertion to bypass TypeScript checking
          const { data: profileData, error: profileError } = await (
            supabase as any
          )
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", article.user_id)
            .single();

          if (profileError) {
            console.warn(
              "Could not fetch profile for article:",
              article.id,
              profileError
            );
            // Still add the article, but without profile data
            articlesWithProfiles.push({
              ...article,
              profiles: null,
            });
          } else {
            // Add article with profile data
            articlesWithProfiles.push({
              ...article,
              profiles: profileData,
            });
          }
        } catch (profileErr) {
          console.warn(
            "Error processing profile for article:",
            article.id,
            profileErr
          );
          articlesWithProfiles.push({
            ...article,
            profiles: null,
          });
        }
      }

      console.log(
        "Articles with profiles processed:",
        articlesWithProfiles.length
      );
      setArticles(articlesWithProfiles);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      setError(`Failed to load articles: ${error.message || "Unknown error"}`);
      setArticles([]);
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

  // Categories list
  const categories = [
    { value: "all", label: "All Categories" },
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

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`px-6 py-3 text-lg font-medium border-b-2 ${
              activeTab === "forYou"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-6 py-3 text-lg font-medium border-b-2 ${
              activeTab === "following"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "forYou" ? (
        <div>
          {/* Category Filter - only shown for "For You" tab */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
              <p className="text-sm mt-2">
                Please make sure your Supabase database is correctly set up with
                the required tables and relationships.
              </p>
            </div>
          )}

          {/* Articles Grid for "For You" */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden article-card animate-pulse"
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
          ) : articles.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-600">
                No articles found in this category.
              </p>
              {user && (
                <Link
                  href="/write"
                  className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Write the First Article
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: Article) => (
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
                        {categories.find((c) => c.value === article.category)
                          ?.label ||
                          article.category ||
                          "Uncategorized"}
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
          )}
        </div>
      ) : (
        // Following Tab Content
        <FollowingFeed />
      )}
    </div>
  );
}
