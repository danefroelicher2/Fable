// src/app/articles/[slug]/page.tsx - UPDATED LAYOUT
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import FeatureArticleButton from "@/components/FeatureArticleButton";
import PinButton from "@/components/PinButton";
import ShareButton from "@/components/ShareButton";
import BookmarkButton from "@/components/BookmarkButton";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import Image from "next/image";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);

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

      // Fetch author profile information
      if (data.user_id) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", data.user_id)
            .single();

          if (!profileError && profileData) {
            setAuthorProfile(profileData);
          }
        } catch (profileErr) {
          console.warn("Error fetching author profile:", profileErr);
        }
      }

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

  // Check if current user is the author
  const isAuthor = user && article && user.id === article.user_id;

  // Generate metadata for Twitter Cards
  const generateMetaTags = () => {
    if (!article) return null;

    const articleUrl = `${window.location.origin}/articles/${article.slug}`;
    const authorName = authorProfile
      ? authorProfile.full_name || authorProfile.username || "Anonymous"
      : "Anonymous";

    // Clean and truncate description
    const description = article.excerpt
      ? article.excerpt.length > 200
        ? article.excerpt.substring(0, 197) + "..."
        : article.excerpt
      : article.content
      ? article.content.length > 200
        ? article.content.substring(0, 197) + "..."
        : article.content
      : "Read this article on LOSTLIBRARY";

    return (
      <Head>
        {/* Basic Meta Tags */}
        <title>{article.title} | LOSTLIBRARY</title>
        <meta name="description" content={description} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="LOSTLIBRARY" />
        {article.image_url && (
          <meta property="og:image" content={article.image_url} />
        )}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@lostxlibrary" />
        <meta name="twitter:creator" content="@lostxlibrary" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={description} />
        {article.image_url && (
          <meta name="twitter:image" content={article.image_url} />
        )}

        {/* Article specific meta tags */}
        <meta property="article:author" content={authorName} />
        <meta
          property="article:published_time"
          content={article.published_at}
        />
        {article.category && (
          <meta property="article:section" content={article.category} />
        )}
      </Head>
    );
  };

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
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: theme === "dark" ? "white" : "black" }}
          >
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
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: theme === "dark" ? "white" : "black" }}
          >
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
    <>
      {/* Generate meta tags for Twitter Cards */}
      {generateMetaTags()}

      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Article Title */}
          <h1
            className="text-4xl font-bold mb-4 text-center"
            style={{ color: theme === "dark" ? "white" : "black" }}
          >
            {article.title}
          </h1>

          {/* Cover Image - MATCHED TO DARK MODE BACKGROUND */}
          {article.image_url && (
            <div className="mb-8">
              <div
                className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg"
                style={{
                  backgroundColor: theme === "dark" ? "#121212" : "#ffffff",
                }}
              >
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-contain rounded-lg"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 768px"
                  quality={85}
                />
              </div>
            </div>
          )}

          {/* Article content with proper text wrapping */}
          <div className="prose dark:prose-invert max-w-none mb-8">
            <div
              className="leading-relaxed text-base break-words overflow-wrap-anywhere"
              style={{
                color: theme === "dark" ? "white" : "black",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
              }}
            >
              {article.content
                .split("\n")
                .map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* UPDATED: Author, Date, and Edit Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            {/* Author Section with Edit Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Author Avatar and Info with Date */}
                {authorProfile && (
                  <Link
                    href={`/user/${authorProfile.id}`}
                    className="flex items-center hover:opacity-80"
                  >
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden mr-3 relative">
                      {authorProfile.avatar_url ? (
                        <img
                          src={authorProfile.avatar_url}
                          alt={authorProfile.username || "Author"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {(
                            authorProfile.full_name ||
                            authorProfile.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {authorProfile.full_name ||
                          authorProfile.username ||
                          "Anonymous"}
                      </div>
                      {authorProfile.username && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{authorProfile.username}
                        </div>
                      )}
                    </div>
                  </Link>
                )}

                {/* Date right next to author info */}
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                  {new Date(article.published_at).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>

              {/* SIMPLIFIED: Edit button without box styling - only show for author */}
              {isAuthor && (
                <Link
                  href={`/articles/${article.slug}/edit`}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          {/* UPDATED: Bottom Action Bar with reorganized buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            {/* Left side - Views, Likes, and Pin (if author) */}
            <div className="flex items-center space-x-6">
              {/* View count */}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-sm">
                  {article.view_count || 0}{" "}
                  {article.view_count === 1 ? "View" : "Views"}
                </span>
              </div>

              {/* MOVED: Like Button next to views */}
              <LikeButton
                articleId={article.id}
                className="text-gray-600 dark:text-gray-400"
              />

              {/* Pin Button - Only show for article author */}
              {isAuthor && (
                <PinButton articleId={article.id} showLabel={true} />
              )}
            </div>

            {/* UPDATED: Right side - Share and Bookmark buttons */}
            <div className="flex items-center space-x-4">
              {/* Share Button */}
              <ShareButton
                articleId={article.id}
                articleSlug={article.slug}
                title={article.title}
                showLabel={true}
              />

              {/* Bookmark Button */}
              <BookmarkButton
                articleId={article.id}
                showText={true}
                className="text-gray-600 dark:text-gray-400"
              />
            </div>
          </div>

          {/* Feature Article Button - Admin only */}
          {article.id && <FeatureArticleButton articleId={article.id} />}

          {/* Comment Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <CommentSection articleId={article.id} />
          </div>
        </div>
      </div>
    </>
  );
}
