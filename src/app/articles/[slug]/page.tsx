// src/app/articles/[slug]/page.tsx with improved author profile link
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { slug } = params;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?.id && user) {
      checkIfLiked();
    }
  }, [article, user]);

  async function fetchArticle() {
    setLoading(true);
    try {
      const { data: articleData, error: articleError } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (articleError) throw articleError;

      // Get like count
      const { count: likesCount, error: likesError } = await (supabase as any)
        .from("likes")
        .select("id", { count: "exact" })
        .eq("article_id", articleData.id);

      if (likesError) throw likesError;

      setArticle(articleData);
      setAuthor(articleData.profiles);
      setLikeCount(likesCount || 0);

      // Increment view count
      try {
        await (supabase as any)
          .from("public_articles")
          .update({ view_count: (articleData.view_count || 0) + 1 })
          .eq("id", articleData.id);
      } catch (updateError) {
        console.error("Error updating view count:", updateError);
        // Continue even if view count update fails
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      // Handle not found
      router.push("/not-found");
    } finally {
      setLoading(false);
    }
  }

  async function checkIfLiked() {
    try {
      if (!user) return; // Skip checking likes if user is not logged in

      const { data, error } = await (supabase as any)
        .from("likes")
        .select("id")
        .eq("article_id", article.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  }

  async function handleLike() {
    if (!user) {
      router.push(
        "/signin?redirect=" + encodeURIComponent(`/articles/${slug}`)
      );
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await (supabase as any)
          .from("likes")
          .delete()
          .eq("article_id", article.id)
          .eq("user_id", user.id);

        setLikeCount((prev) => prev - 1);
      } else {
        // Like
        await (supabase as any).from("likes").insert({
          article_id: article.id,
          user_id: user.id,
        });

        setLikeCount((prev) => prev + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null; // Will redirect via the useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        {/* Improved Author Section with link to profile */}
        <div className="flex items-center mb-6">
          <Link
            href={`/profile/${author?.id}`}
            className="flex items-center group"
          >
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 overflow-hidden">
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.username || "User"}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                (
                  author?.username?.charAt(0) ||
                  author?.full_name?.charAt(0) ||
                  "U"
                ).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-medium group-hover:text-blue-600 transition">
                {author?.full_name || author?.username || "Anonymous"}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </div>

        {article.category && (
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {article.category}
            </span>
          </div>
        )}

        {article.image_url && (
          <div className="mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div className="prose max-w-none mb-10">
          {/* Render content with markdown support if needed */}
          <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
        </div>

        <div className="border-t border-b py-4 mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex items-center ${
                isLiked ? "text-red-600" : "text-gray-600"
              }`}
              aria-label={isLiked ? "Unlike this article" : "Like this article"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="ml-2">
                {likeCount} {likeCount === 1 ? "Like" : "Likes"}
              </span>
            </button>
          </div>

          <div className="text-gray-600 text-sm">
            {article.view_count || 1}{" "}
            {(article.view_count || 1) === 1 ? "View" : "Views"}
          </div>
        </div>

        {/* Author Card with more details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-start">
            <Link href={`/profile/${author?.id}`} className="shrink-0">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden">
                {author?.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (
                    author?.username?.charAt(0) ||
                    author?.full_name?.charAt(0) ||
                    "U"
                  ).toUpperCase()
                )}
              </div>
            </Link>
            <div className="ml-4">
              <Link
                href={`/profile/${author?.id}`}
                className="block text-lg font-medium hover:text-blue-600"
              >
                {author?.full_name || author?.username || "Anonymous"}
              </Link>
              {author?.username && (
                <p className="text-gray-600 text-sm">@{author.username}</p>
              )}
              <Link
                href={`/profile/${author?.id}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm"
              >
                View author profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {article.id && <CommentSection articleId={article.id} />}
      </div>
    </div>
  );
}
