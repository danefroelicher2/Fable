// src/components/AutoScrollingCommunityFeed.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import "./AutoScrollingFeed.css"; // Import the CSS file

// Type for profile data
interface ProfileData {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

// Type for article data without profile details
interface BaseArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string;
  view_count: number;
  image_url?: string | null;
  user_id: string;
}

// Extend BaseArticle with profile information
interface Article extends BaseArticle {
  profiles: ProfileData | null;
}

export default function AutoScrollingCommunityFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Animation state with increased speed
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollSpeed = 1.5; // Increased from 0.5 to 1.5 for faster scrolling

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  // Animation effect - refined implementation with no pause functionality
  useEffect(() => {
    if (!scrollContainerRef.current || articles.length === 0 || loading) {
      return; // Don't animate if we don't have articles or still loading
    }

    let animationFrameId: number;
    let lastTimestamp: number | null = null;
    let currentScrollPos = scrollPosition; // Local variable to track position

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (scrollContainerRef.current) {
        // Calculate new scroll position based on delta time for smooth animation
        currentScrollPos += (scrollSpeed * deltaTime) / 16; // normalize to ~60fps

        // Handle edge case: reaching the end
        const container = scrollContainerRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (currentScrollPos >= maxScrollLeft) {
          // Reset to beginning for infinite scroll
          currentScrollPos = 0;
          container.scrollLeft = 0;
        } else {
          // Update scroll position
          container.scrollLeft = currentScrollPos;
        }

        // Update the React state occasionally to avoid re-renders
        if (Math.abs(scrollPosition - currentScrollPos) > 50) {
          setScrollPosition(currentScrollPos);
        }
      }

      // Continue the animation loop
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation
    animationFrameId = requestAnimationFrame(animate);

    // Clean up when component unmounts
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [articles, loading]); // Removed scrollPosition and isPaused from dependencies

  async function fetchRecentArticles() {
    try {
      setLoading(true);
      setError(null);

      // bypass type checking with 'any'
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          "id, title, slug, excerpt, category, published_at, view_count, image_url, user_id"
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(15); // Explicitly limit to exactly 15 most recent articles

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No articles found");
        setArticles([]);
        setLoading(false);
        return;
      }

      // Fetch user information for each article
      const articlesWithUserInfo: Article[] = await Promise.all(
        data.map(async (article: BaseArticle) => {
          try {
            // Fetch user profile separately for each article
            // @ts-ignore - We're using a simple string for the select statement to avoid type issues
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", article.user_id)
              .single();

            if (userError) {
              console.warn(
                `Could not fetch user for article ${article.id}:`,
                userError
              );
              return { ...article, profiles: null };
            }

            return {
              ...article,
              profiles: userData as ProfileData,
            };
          } catch (err) {
            console.warn(
              `Error processing user for article ${article.id}:`,
              err
            );
            return { ...article, profiles: null };
          }
        })
      );

      // No longer need to duplicate articles for infinite scrolling
      // We'll handle that differently with our true infinite scroll implementation
      setArticles(articlesWithUserInfo);
    } catch (error: any) {
      console.error("Error fetching recent articles:", error);
      setError("Failed to load recent articles");
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
      <div className="auto-scrolling-container">
        <div className="auto-scrolling-inner flex space-x-6">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="min-w-[280px] feed-card bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-[#eae9e4]"
            >
              <div className="h-36 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-[#eae9e4]">
        <p className="text-gray-500">
          No community articles found. Be the first to contribute!
        </p>
        <Link
          href="/write"
          className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Write an Article
        </Link>
      </div>
    );
  }

  return (
    <div className="auto-scrolling-container">
      <div
        ref={scrollContainerRef}
        className="auto-scrolling-inner flex space-x-6 overflow-x-auto scrollbar-hide"
      >
        {articles.map((article, index) => (
          <Link
            key={`${article.id}-${index}`} // Using index for duplicated articles
            href={`/articles/${article.slug}`}
            className="min-w-[280px] feed-card bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-[#eae9e4] hover:shadow-lg transition-shadow"
          >
            <div className="h-36 bg-slate-200 overflow-hidden">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 p-2">
                  <p className="text-center text-sm line-clamp-3">
                    {article.title}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="inline-block">
                  {article.profiles?.full_name ||
                    article.profiles?.username ||
                    "Anonymous"}
                </span>
                <span className="mx-1">•</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* View more link - at the end but not part of scrolling content */}
        <Link
          href="/feed"
          className="min-w-[120px] feed-card bg-red-50 rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-red-100 hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <div className="flex flex-col items-center justify-center p-4 h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span className="text-sm font-medium text-red-600">View All</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
