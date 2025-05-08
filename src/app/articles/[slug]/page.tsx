// src/app/articles/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";
import { togglePinnedPost, isArticlePinned } from "@/lib/pinnedPostUtils";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Extract slug from params
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?.id && user) {
      checkIfLiked();

      // Check if article is pinned
      const pinned = isArticlePinned(user.id, article.id);
      setIsPinned(pinned);
    }
  }, [article, user]);

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
        setNotFoundTriggered(true);
        return;
      }

      console.log("Article found:", data);
      setArticle(data);

      // 2. Fetch the author if we have user_id
      if (data.user_id) {
        const { data: authorData, error: authorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user_id)
          .single();

        if (!authorError && authorData) {
          setAuthor(authorData);
        }
      }

      // 3. Get like count
      const { count, error: likesError } = await (supabase as any)
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("article_id", data.id);

      if (!likesError && count !== null) {
        setLikeCount(count);
      }

      // 4. Update view count
      if (data.id) {
        const currentViewCount =
          typeof data.view_count === "number" ? data.view_count : 0;
        await (supabase as any)
          .from("public_articles")
          .update({ view_count: currentViewCount + 1 })
          .eq("id", data.id);
      }
    } catch (error) {
      console.error("Error in article fetch flow:", error);
      setNotFoundTriggered(true);
    } finally {
      setLoading(false);
    }
  }

  async function checkIfLiked() {
    if (!user || !article?.id) return;

    try {
      const { data, error } = await (supabase as any)
        .from("likes")
        .select("*")
        .eq("article_id", article.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) {
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  }

  // src/app/articles/[slug]/page.tsx (modified)

  async function handleLike() {
    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/articles/${slug}`)}`
      );
      return;
    }

    if (!article?.id) return;

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

        // Create a notification for the article owner (if it's not the current user)
        if (article.user_id !== user.id) {
          try {
            await (supabase as any).from("notifications").insert({
              user_id: article.user_id,
              action_type: "like",
              action_user_id: user.id,
              article_id: article.id,
              created_at: new Date().toISOString(),
              is_read: false,
            });
          } catch (notifyError) {
            console.error("Error creating like notification:", notifyError);
            // Continue even if notification creation fails
          }
        }

        setLikeCount((prev) => prev + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  // Function to handle pinning/unpinning an article
  const handleTogglePin = () => {
    if (!user || !article?.id) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/articles/${slug}`)}`
      );
      return;
    }

    // Only allow pinning of own articles
    if (user.id !== article.user_id) {
      setPinError("You can only pin your own articles");
      setTimeout(() => setPinError(null), 3000);
      return;
    }

    setPinError(null);
    const success = togglePinnedPost(user.id, article.id);

    if (success) {
      setIsPinned(!isPinned);
    } else if (!isPinned) {
      // Show error message that max pins reached
      setPinError("You can only pin up to 4 articles");
      setTimeout(() => setPinError(null), 3000);
    }
  };

  // Render not-found if the article doesn't exist
  if (notFoundTriggered) {
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
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {pinError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {pinError}
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4 dark:text-white">
          {article.title}
        </h1>

        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3 overflow-hidden">
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.username || "User"}
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <span className="text-lg font-medium">
                  {(author?.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              {author?.id ? (
                <Link
                  href={`/user/${author.id}`}
                  className="font-medium hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                >
                  {author?.full_name || author?.username || "Anonymous"}
                </Link>
              ) : (
                <span className="font-medium dark:text-white">
                  {author?.full_name || author?.username || "Anonymous"}
                </span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(article.published_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
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

        <div className="prose dark:prose-invert max-w-none mb-10">
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="dark:text-gray-300"
          ></div>
        </div>

        <div className="border-t dark:border-gray-700 border-b py-4 mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex items-center ${
                isLiked
                  ? "text-red-600 dark:text-red-500"
                  : "text-gray-600 dark:text-gray-400"
              } hover:text-red-500 dark:hover:text-red-400 transition-colors`}
              aria-label={isLiked ? "Unlike this article" : "Like this article"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transition-transform hover:scale-110"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isLiked ? "1" : "2"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="ml-2">
                {likeCount} {likeCount === 1 ? "Like" : "Likes"}
              </span>
            </button>

            {/* Pin/Unpin button - only visible to article author */}
            {user && user.id === article.user_id && (
              <button
                onClick={handleTogglePin}
                className={`flex items-center ${
                  isPinned
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-600 dark:text-gray-400"
                } hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-4`}
                aria-label={
                  isPinned ? "Unpin this article" : "Pin this article"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transition-transform hover:scale-110"
                  fill={isPinned ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isPinned ? "1" : "2"}
                >
                  <path d="M11.39 1.578a1 1 0 0 0-.78 0L2.5 5.5v9l8.11 3.922a1 1 0 0 0 .78 0L19.5 14.5v-9l-8.11-3.922z" />
                </svg>
                <span className="ml-2">
                  {isPinned ? "Pinned" : "Pin Article"}
                </span>
              </button>
            )}
          </div>

          <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
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
        </div>

        {article.id && <CommentSection articleId={article.id} />}
      </div>
    </div>
  );
}
