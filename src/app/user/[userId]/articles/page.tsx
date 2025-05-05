// src/app/user/[userId]/articles/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FollowButton from "@/components/FollowButton";
import DeleteButton from "@/components/DeleteButton";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string;
  view_count: number;
  image_url?: string | null;
  like_count?: number;
  user_id: string;
}

export default function UserArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const userId = typeof params?.userId === "string" ? params.userId : null;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [displayType, setDisplayType] = useState<"grid" | "list">("grid");
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Add console logging for debugging
  useEffect(() => {
    console.log("User articles page mounted with userId:", userId);

    if (!userId) {
      console.error("No userId provided in URL params");
      router.push("/not-found");
      return;
    }

    setIsCurrentUser(user?.id === userId);
    fetchData();
  }, [userId, router, user]);

  async function fetchData() {
    try {
      setLoading(true);
      console.log("Fetching data for userId:", userId);

      if (!userId) return;

      // Fetch profile first
      await fetchProfile();

      // Then fetch articles
      await fetchArticles();
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to load page data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      if (!userId) return;

      console.log("Fetching profile for userId:", userId);

      // Query for the user profile
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === "PGRST116") {
          // Profile not found
          throw new Error("User profile not found");
        }
        throw error;
      }

      console.log("Profile fetched:", data);
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    }
  }

  async function fetchArticles() {
    try {
      if (!userId) return;

      console.log("Fetching articles for userId:", userId);

      // Get count of total articles
      const { count, error: countError } = await (supabase as any)
        .from("public_articles")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_published", true);

      if (countError) {
        console.error("Error fetching article count:", countError);
        throw countError;
      }

      console.log(`Total articles found: ${count}`);
      setTotalArticles(count || 0);

      // Fetch all articles
      const { data, error } = await (supabase as any)
        // src/app/user/[userId]/articles/page.tsx (continued)
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
        .eq("user_id", userId)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Process articles to add like counts if possible
      let processedArticles = data || [];
      try {
        // Add placeholder like counts to avoid errors
        processedArticles = processedArticles.map((article: Article) => ({
          ...article,
          like_count: 0,
        }));

        // Try to get like counts for each article
        processedArticles = await Promise.all(
          processedArticles.map(async (article: Article) => {
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
              console.warn(
                `Couldn't get like count for article ${article.id}:`,
                err
              );
              return article;
            }
          })
        );
      } catch (err) {
        console.warn("Error getting like counts:", err);
        // Continue with articles even if like counts fail
      }

      setArticles(processedArticles);
    } catch (err) {
      console.error("Error in fetchArticles:", err);
      setError("Failed to load articles");
    }
  }

  // Handle article deletion
  const handleArticleDeleted = (articleId: string) => {
    // Remove the deleted article from the state
    setArticles(articles.filter((article) => article.id !== articleId));

    // Update the total count
    setTotalArticles((prev) => Math.max(0, prev - 1));
  };

  // Format date (e.g., "Mar 15, 2024")
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      console.warn("Date formatting error:", err);
      return "Unknown date";
    }
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="mb-6">
            The user profile you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header (simplified) */}
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden mr-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl">
                {(profile.full_name || profile.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {profile.full_name || profile.username || "Anonymous User"}'s
              Articles
            </h1>
            {profile.username && (
              <p className="text-gray-600">@{profile.username}</p>
            )}
          </div>

          <div className="ml-auto">
            {!isCurrentUser && <FollowButton targetUserId={profile.id} />}
            <Link
              href={`/user/${profile.id}`}
              className="text-blue-600 hover:text-blue-800 ml-4"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Published Articles</h2>
            <p className="text-gray-600">Total: {totalArticles}</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setDisplayType("grid")}
              className={`p-2 rounded ${
                displayType === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              aria-label="Grid view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setDisplayType("list")}
              className={`p-2 rounded ${
                displayType === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              aria-label="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              This user hasn't published any articles yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        ) : displayType === "grid" ? (
          // Grid display with 4 columns
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {articles.map((article) => (
              <div key={article.id} className="relative group">
                <Link
                  href={`/articles/${article.slug}`}
                  className="block bg-gray-100 rounded overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Square cover image */}
                  <div className="aspect-square bg-gray-200 relative">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 p-2">
                        <span className="text-center text-sm">
                          {article.title}
                        </span>
                      </div>
                    )}

                    {/* Category tag */}
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
                      {formatDate(article.published_at)}
                    </p>
                  </div>
                </Link>

                {/* Delete button overlay - only for the current user */}
                {isCurrentUser && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <DeleteButton
                      articleId={article.id}
                      onDelete={() => handleArticleDeleted(article.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // List display
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="md:flex">
                  {article.image_url && (
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-full bg-slate-200">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-6 ${
                      article.image_url ? "md:w-2/3" : "w-full"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold mb-2">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-gray-800 hover:text-blue-600"
                        >
                          {article.title}
                        </Link>
                      </h3>

                      {/* Delete button - only for the current user */}
                      {isCurrentUser && (
                        <DeleteButton
                          articleId={article.id}
                          onDelete={() => handleArticleDeleted(article.id)}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>{formatDate(article.published_at)}</span>
                      <div className="flex space-x-3">
                        <span className="flex items-center">
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
                          {article.view_count}
                        </span>
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {article.like_count || 0}
                        </span>
                      </div>
                    </div>
                    {article.excerpt && (
                      <p className="text-gray-700">{article.excerpt}</p>
                    )}
                    <div className="mt-4">
                      {article.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {article.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
