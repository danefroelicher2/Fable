// src/app/bookmarks/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  user?: {
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

  useEffect(() => {
    // Redirect if not authenticated
    if (!user && !loading) {
      router.push("/signin?redirect=" + encodeURIComponent("/bookmarks"));
      return;
    }

    if (user) {
      fetchBookmarks();
    }
  }, [user, router]);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      setError(null);

      // Add null check for user
      if (!user) {
        setError("You must be logged in to view bookmarks");
        setLoading(false);
        return;
      }

      // Fetch bookmarks with article and post information
      const { data: bookmarkData, error: bookmarkError } = await (
        supabase as any
      )
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarkError) throw bookmarkError;

      // Initialize an array to hold processed bookmarks
      const processedBookmarks: BookmarkedItem[] = [];

      // Process each bookmark
      for (const bookmark of bookmarkData || []) {
        if (bookmark.post_id) {
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
              user: userData || null,
              community: communityData || null,
            });
          }
        } else if (bookmark.article_id) {
          // Fetch article details
          const { data: articleData, error: articleError } = await (
            supabase as any
          )
            .from("public_articles")
            .select(
              `
              id, title, content, created_at, user_id, slug
            `
            )
            .eq("id", bookmark.article_id)
            .single();

          if (articleError) {
            console.error("Error fetching article:", articleError);
            continue;
          }

          if (articleData) {
            // Fetch user profile
            const { data: userData } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", articleData.user_id)
              .single();

            processedBookmarks.push({
              ...articleData,
              type: "article",
              user: userData || null,
            });
          }
        }
      }

      setBookmarks(processedBookmarks);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format content preview
  const formatPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Get the path for a bookmarked item
  const getItemPath = (item: BookmarkedItem) => {
    if (item.type === "article") {
      return `/articles/${item.slug || item.id}`;
    } else {
      return `/communities/${item.community_id}/posts/${item.id}`;
    }
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
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Bookmarks</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have any bookmarks yet.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Start exploring and bookmarking posts and articles that interest
              you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                        <Link
                          href={getItemPath(item)}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Link
                          href={`/user/${item.user_id}`}
                          className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 mr-3"
                        >
                          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 mr-2 overflow-hidden">
                            {item.user?.avatar_url ? (
                              <img
                                src={item.user.avatar_url}
                                alt={item.user?.username || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {(
                                  item.user?.username ||
                                  item.user?.full_name ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          {item.user?.full_name ||
                            item.user?.username ||
                            "Anonymous"}
                        </Link>
                        <span className="mx-2">•</span>
                        <span>{formatDate(item.created_at)}</span>
                        {item.type === "post" && item.community && (
                          <>
                            <span className="mx-2">•</span>
                            <Link
                              href={`/communities/${item.community_id}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {item.community.name}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    <BookmarkButton
                      postId={item.type === "post" ? item.id : undefined}
                      articleId={item.type === "article" ? item.id : undefined}
                    />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {formatPreview(item.content)}
                  </p>
                  <Link
                    href={getItemPath(item)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
