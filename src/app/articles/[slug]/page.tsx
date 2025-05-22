// src/app/articles/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import FeatureArticleButton from "@/components/FeatureArticleButton";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract slug from params
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  async function fetchArticle() {
    setLoading(true);
    try {
      console.log("Fetching article with slug:", slug);

      // Use type assertion to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        setError("Article not found or has been removed.");
        return;
      }

      console.log("Article found:", data);
      setArticle(data);

      // Update view count if article was found
      if (data?.id) {
        const currentViewCount =
          typeof data.view_count === "number" ? data.view_count : 0;
        await (supabase as any)
          .from("public_articles")
          .update({ view_count: currentViewCount + 1 })
          .eq("id", data.id);
      }
    } catch (error) {
      console.error("Error in article fetch flow:", error);
      setError("An error occurred while loading the article.");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Article not found
  if (!article) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">
          {article.title}
        </h1>

        <div className="flex items-center mb-6">
          {/* Author info and date would go here */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(article.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {article.image_url && (
          <div className="mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {article.category && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm">
              {article.category}
            </span>
          </div>
        )}

        {/* Article content - with whitespace preserved */}
        <div className="prose dark:prose-invert max-w-none mb-10">
          <div className="whitespace-pre-line dark:text-gray-300">
            {article.content}
          </div>
        </div>

        {/* View count display */}
        <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
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
          {article.view_count || 0}{" "}
          {article.view_count === 1 ? "View" : "Views"}
        </div>

        {/* Add Feature Button - only shown for admin user */}
        {article.id && <FeatureArticleButton articleId={article.id} />}
      </div>
    </div>
  );
}
