// src/app/profile/[userId]/articles/page.tsx (if it exists)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FollowButton from "@/components/FollowButton";
import FollowStats from "@/components/FollowStats";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  social_links?: {
    instagram?: string | null;
    facebook?: string | null;
    x?: string | null;
  } | null;
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
}

export default function UserProfilePage() {
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
  const [bio, setBio] = useState<string>("");

  // Add console logging for debugging
  useEffect(() => {
    console.log("User profile page mounted with userId:", userId);

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

      // Load bio from localStorage if available
      if (typeof window !== "undefined") {
        const savedBio = localStorage.getItem("userBio_" + userId);
        if (savedBio) {
          setBio(savedBio);
        }
      }
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
          view_count,
          image_url
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

  // Helper function to format social media links
  const formatSocialLinks = (links: any) => {
    if (!links) return [];

    const formattedLinks = [];

    if (links.instagram) {
      formattedLinks.push({
        name: "Instagram",
        url: links.instagram.startsWith("http")
          ? links.instagram
          : `https://instagram.com/${links.instagram}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      });
    }

    if (links.facebook) {
      formattedLinks.push({
        name: "Facebook",
        url: links.facebook.startsWith("http")
          ? links.facebook
          : `https://facebook.com/${links.facebook}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
          </svg>
        ),
      });
    }

    if (links.x) {
      formattedLinks.push({
        name: "X",
        url: links.x.startsWith("http")
          ? links.x
          : `https://twitter.com/${links.x}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        ),
      });
    }

    return formattedLinks;
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
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <div className="h-48 w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-6xl">
                  {(profile.full_name || profile.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="md:w-2/3 md:pl-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <h1 className="text-3xl font-bold">
                {profile.full_name || profile.username || "Anonymous User"}
              </h1>

              {!isCurrentUser && <FollowButton targetUserId={profile.id} />}
            </div>

            {profile.username && (
              <p className="text-gray-600 mb-4">@{profile.username}</p>
            )}

            {bio && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Bio</h3>
                <p className="text-gray-700 whitespace-pre-line">{bio}</p>
              </div>
            )}

            {/* Social Media Links */}
            {profile.social_links &&
              Object.values(profile.social_links).some((link) => link) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">Connect</h3>
                  <div className="flex space-x-4">
                    {formatSocialLinks(profile.social_links).map(
                      (link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                          aria-label={`Connect on ${link.name}`}
                        >
                          <span className="mr-2">{link.icon}</span>
                          <span>{link.name}</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Stats section */}
            <div className="mb-4">
              <FollowStats userId={profile.id} className="mb-2" />

              {isCurrentUser && (
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-800 flex items-center mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit Your Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
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
          // Instagram-style grid of articles - Changed to 4 columns
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block aspect-square bg-gray-100 relative overflow-hidden group"
              >
                {/* Square Article Thumbnail */}
                <div className="w-full h-full bg-slate-200 relative">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 p-4">
                      <p className="text-center font-medium line-clamp-3">
                        {article.title}
                      </p>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                    <h3 className="font-bold text-center mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    <div className="flex items-center space-x-3 mt-2">
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
                        {article.view_count || 0}
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
                </div>
              </Link>
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
                    <h3 className="text-xl font-bold mb-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                    </h3>
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
