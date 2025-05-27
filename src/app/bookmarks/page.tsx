// src/app/bookmarks/page.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BookmarkButton from "@/components/BookmarkButton";

interface BookmarkedItem {
  id: string;
  type: "post" | "article";
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  community_id?: string;
  slug?: string;
  user_info?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  community?: {
    name: string | null;
  };
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "articles" | "community"
  >("all");

  // FIXED: Use useCallback to prevent function recreation on every render
  const loadBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Loading bookmarks for user:", user.id);

      // Fetch bookmarks with article and post information
      const { data: bookmarkData, error: bookmarkError } = await (
        supabase as any
      )
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarkError) throw bookmarkError;

      console.log("Raw bookmark data:", bookmarkData);

      // Initialize an array to hold processed bookmarks
      const processedBookmarks: BookmarkedItem[] = [];

      // Process each bookmark based on the active filter
      for (const bookmark of bookmarkData || []) {
        // Skip based on filter
        if (
          (activeFilter === "articles" && !bookmark.article_id) ||
          (activeFilter === "community" && !bookmark.post_id)
        ) {
          continue;
        }

        if (bookmark.post_id) {
          // For community posts
          try {
            console.log("Processing community post:", bookmark.post_id);

            // Fetch post details
            const { data: postData, error: postError } = await (supabase as any)
              .from("community_posts")
              .select(
                `
                id, title, content, created_at, user_id, community_id
              `
              )
              .eq("id", bookmark.post_id)
              .single();

            if (postError) {
              console.error("Error fetching post:", postError);
              continue;
            }

            if (postData) {
              console.log("Post data found:", postData);

              // Fetch user profile
              const { data: userData } = await supabase
                .from("profiles")
                .select("username, full_name, avatar_url")
                .eq("id", postData.user_id)
                .single();

              // Fetch community name
              const { data: communityData } = await (supabase as any)
                .from("communities")
                .select("name")
                .eq("id", postData.community_id)
                .single();

              processedBookmarks.push({
                ...postData,
                type: "post",
                user_info: userData || null,
                community: communityData || null,
              });
            }
          } catch (postErr) {
            console.error("Error processing post bookmark:", postErr);
          }
        } else if (bookmark.article_id) {
          // For published articles
          try {
            console.log("Processing article:", bookmark.article_id);

            // Fetch article details - using updated_at instead of created_at
            const { data: articleData, error: articleError } = await (
              supabase as any
            )
              .from("public_articles")
              .select(
                `
                id, title, content, updated_at, user_id, slug, published_at
              `
              )
              .eq("id", bookmark.article_id)
              .single();

            if (articleError) {
              console.error("Error fetching article:", articleError);
              continue;
            }

            if (articleData) {
              console.log("Article data found:", articleData);

              // Map updated_at to created_at for consistent UI rendering
              const processedArticleData = {
                ...articleData,
                created_at: articleData.updated_at || articleData.published_at,
              };

              // Fetch user profile
              const { data: userData } = await supabase
                .from("profiles")
                .select("username, full_name, avatar_url")
                .eq("id", articleData.user_id)
                .single();

              processedBookmarks.push({
                ...processedArticleData,
                type: "article",
                user_info: userData || null,
              });
            }
          } catch (articleErr) {
            console.error("Error processing article bookmark:", articleErr);
          }
        }
      }

      console.log("Processed bookmarks:", processedBookmarks);
      setBookmarks(processedBookmarks);
    } catch (err: any) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter]); // FIXED: Added proper dependencies

  // FIXED: Separate useEffect for auth check
  useEffect(() => {
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent("/bookmarks")}`);
    }
  }, [user, router]);

  // FIXED: Separate useEffect for loading bookmarks
  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user, loadBookmarks]); // FIXED: Proper dependency array

  // Show auth required message if not logged in
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please sign in to view your bookmarks.</p>
          <Link
            href={`/signin?redirect=${encodeURIComponent("/bookmarks")}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format content preview - FIXED: Only show "Read more" if content is actually truncated
  const formatPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) {
      return { preview: content, isTruncated: false };
    }
    return {
      preview: content.substring(0, maxLength) + "...",
      isTruncated: true,
    };
  };

  // FIXED: Get the correct path for a bookmarked item
  const getItemPath = (item: BookmarkedItem) => {
    if (item.type === "article") {
      return `/articles/${item.slug || item.id}`;
    } else {
      // FIXED: Proper community post URL structure
      return `/communities/${item.community_id}/posts/${item.id}`;
    }
  };

  // FIXED: Improved type badge styling to match your design
  const getTypeBadge = (item: BookmarkedItem) => {
    if (item.type === "article") {
      return (
        <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-[10px] font-medium">
          Article
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-[10px] font-medium">
          Community
        </span>
      );
    }
  };

  // FIXED: Improved community badge styling to match your "Community" button design
  const getCommunityBadge = (item: BookmarkedItem) => {
    if (item.type === "post" && item.community) {
      return (
        <Link
          href={`/communities/${item.community_id}`}
          className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded font-medium hover:bg-green-200 transition-colors"
          style={{ fontSize: "10px" }}
          onClick={(e) => e.stopPropagation()} // Prevent parent link from firing
        >
          {item.community.name}
        </Link>
      );
    }
    return null;
  };

  // If still loading
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Bookmarks</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Bookmarks</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("articles")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeFilter === "articles"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveFilter("community")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeFilter === "community"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Community
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {activeFilter === "all"
                ? "You don't have any bookmarks yet."
                : activeFilter === "articles"
                ? "You don't have any bookmarked articles yet."
                : "You don't have any bookmarked community posts yet."}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {activeFilter === "all" || activeFilter === "articles" ? (
                <>
                  Start exploring and bookmarking content that interests you.{" "}
                  <Link
                    href="/feed"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Check out the community feed
                  </Link>
                </>
              ) : (
                <>
                  Start exploring and bookmarking content that interests you.{" "}
                  <Link
                    href="/communities"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Explore communities
                  </Link>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((item) => {
              const { preview, isTruncated } = formatPreview(item.content);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    {/* FIXED: Header with badges and bookmark button */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        {getTypeBadge(item)}
                        {getCommunityBadge(item)}
                      </div>

                      <BookmarkButton
                        postId={item.type === "post" ? item.id : undefined}
                        articleId={
                          item.type === "article" ? item.id : undefined
                        }
                        size="sm"
                        showText={false}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                      <Link
                        href={getItemPath(item)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    {/* Content preview */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {preview}
                    </p>

                    {/* FIXED: Only show "Read more" if content is actually truncated */}
                    {isTruncated && (
                      <Link
                        href={getItemPath(item)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium inline-block mb-4"
                      >
                        Read more →
                      </Link>
                    )}

                    {/* FIXED: Author info moved to bottom with horizontal layout */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href={`/user/${item.user_id}`}
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-4"
                      >
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 mr-2 overflow-hidden">
                          {item.user_info?.avatar_url ? (
                            <img
                              src={item.user_info.avatar_url}
                              alt={item.user_info?.username || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">
                              {(
                                item.user_info?.username ||
                                item.user_info?.full_name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium leading-none">
                          {item.user_info?.full_name ||
                            item.user_info?.username ||
                            "Anonymous"}
                        </span>
                      </Link>

                      {/* FIXED: Date now appears horizontally next to the user with proper alignment */}
                      <span className="text-gray-400 dark:text-gray-500 leading-none">
                        {formatDate(
                          item.type === "article"
                            ? (item as any).published_at || item.created_at
                            : item.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
