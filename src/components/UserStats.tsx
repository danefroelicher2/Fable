// src/components/UserStats.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserStatsProps {
  userId: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  view_count: number | null;
}

interface Stats {
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  latestArticles: Article[];
}

export default function UserStats({ userId }: UserStatsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    articleCount: 0,
    totalViews: 0,
    totalLikes: 0,
    latestArticles: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  async function fetchUserStats() {
    try {
      setLoading(true);
      setError("");

      // 1. Get article count and total views
      const { data: articlesData, error: articlesError } = await (
        supabase as any
      )
        .from("public_articles")
        .select("id, title, slug, view_count, published_at")
        .eq("user_id", userId)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (articlesError) throw articlesError;

      // 2. Get total likes
      let totalLikes = 0;
      for (const article of articlesData as Article[]) {
        const { count, error: likesError } = await (supabase as any)
          .from("likes")
          .select("id", { count: "exact" })
          .eq("article_id", article.id);

        if (likesError) throw likesError;
        totalLikes += count || 0;
      }

      // 3. Calculate stats
      const articleCount = articlesData ? articlesData.length : 0;
      const totalViews = articlesData
        ? (articlesData as Article[]).reduce(
            (sum: number, article: Article) => sum + (article.view_count || 0),
            0
          )
        : 0;

      // 4. Get latest 5 articles for the activity feed
      const latestArticles = articlesData
        ? (articlesData as Article[]).slice(0, 5)
        : [];

      setStats({
        articleCount,
        totalViews,
        totalLikes,
        latestArticles,
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError("Failed to load user statistics");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg">
              <div className="h-8 bg-gray-200 rounded mb-2 w-20 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ))}
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.articleCount}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.articleCount === 1
              ? "Article Published"
              : "Articles Published"}
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.totalViews}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.totalViews === 1 ? "Total View" : "Total Views"}
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalLikes}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.totalLikes === 1 ? "Total Like" : "Total Likes"}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        {stats.latestArticles.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.latestArticles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">{article.title}</div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">
                    Published on {formatDate(article.published_at)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article.view_count} views
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
