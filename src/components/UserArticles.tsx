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
  like_count?: number;
}

interface UserArticlesProps {
  userId: string;
  limit?: number;
  showViewAll?: boolean;
}

export default function UserArticles({
  userId,
  limit = 3,
  showViewAll = true,
}: UserArticlesProps) {
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
          view_count
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
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
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">
          This user hasn't published any articles yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of 4 articles per row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block bg-gray-100 rounded overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Square placeholder for article */}
            <div className="aspect-square bg-gray-200 relative flex items-center justify-center">
              <span className="text-center text-gray-500 px-2 text-sm">
                {article.title}
              </span>

              {/* Category tag if exists */}
              {article.category && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {article.category}
                </span>
              )}
            </div>

            {/* Title and date below image */}
            <div className="p-3">
              <h3 className="text-gray-800 font-medium text-sm line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {showViewAll && articles.length > 0 && (
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
