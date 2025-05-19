// src/components/HorizontalCommunityFeed.tsx
"use client";

import { useState, useEffect } from "react";
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
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function HorizontalCommunityFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  async function fetchRecentArticles() {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent articles from public_articles table
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
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10); // Limit to 10 most recent articles

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No articles found");
        setArticles([]);
        setLoading(false);
        return;
      }

      // Fetch user information for each article
      const articlesWithUserInfo = await Promise.all(
        data.map(async (article: Article) => {
          try {
            const { data: userData, error: userError } = await (supabase as any)
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", article.user_id)
              .single();

            if (userError) {
              console.warn(
                `Could not fetch user for article ${article.id}:`,
                userError
              );
              return { ...article, profiles: null };
            }

            return { ...article, profiles: userData };
          } catch (err) {
            console.warn(
              `Error processing user for article ${article.id}:`,
              err
            );
            return { ...article, profiles: null };
          }
        })
      );

      setArticles(articlesWithUserInfo);
    } catch (error: any) {
      console.error("Error fetching recent articles:", error);
      setError("Failed to load recent articles");
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
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-6 animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="min-w-[280px] bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0"
            >
              <div className="h-36 bg-slate-200"></div>
              <div className="p-4">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="min-w-[280px] bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="h-36 bg-slate-200 overflow-hidden">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 p-2">
                  <p className="text-center text-sm line-clamp-3">
                    {article.title}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="inline-block">
                  {article.profiles?.full_name ||
                    article.profiles?.username ||
                    "Anonymous"}
                </span>
                <span className="mx-1">•</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* View more arrow card at the end */}
        <Link
          href="/feed"
          className="min-w-[120px] bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <div className="flex flex-col items-center justify-center p-4 h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">View All</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
