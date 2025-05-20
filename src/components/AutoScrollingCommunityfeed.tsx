// src/components/AutoScrollingCommunityFeed.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string;
  view_count: number;
  image_url?: string | null;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function AutoScrollingCommunityFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Variables to track scrolling state
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollSpeed = 0.5; // pixels per frame - adjust for faster/slower scrolling
  const pauseDuration = 3000; // 3 seconds pause when hovering

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  // Animation effect
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    let pauseTimeout: NodeJS.Timeout | null = null;

    // Function to handle the scrolling animation
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused && scrollContainerRef.current) {
        // Calculate new scroll position
        let newPosition = scrollPosition + scrollSpeed * (deltaTime / 16); // Normalize to ~60fps

        // Handle edge case: when reaching the end, reset to the beginning
        const containerWidth = scrollContainerRef.current.scrollWidth;
        const viewportWidth = scrollContainerRef.current.offsetWidth;

        if (newPosition > containerWidth - viewportWidth) {
          // Reset to beginning with a small offset to create a smooth transition
          newPosition = 0;
        }

        // Update state and DOM
        setScrollPosition(newPosition);
        scrollContainerRef.current.scrollLeft = newPosition;
      }

      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation if articles are loaded and not in loading state
    if (!loading && articles.length > 0) {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Clean up the animation frame
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
      }
    };
  }, [isPaused, loading, articles, scrollPosition]);

  // Mouse event handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    // Small delay before resuming scrolling
    setTimeout(() => {
      setIsPaused(false);
    }, pauseDuration);
  };

  async function fetchRecentArticles() {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent articles from public_articles table
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
          image_url,
          user_id
        `
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(15); // Get more articles for continuous scrolling

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No articles found");
        setArticles([]);
        setLoading(false);
        return;
      }

      // Fetch user information for each article
      const articlesWithUserInfo = await Promise.all(
        data.map(async (article: Article) => {
          try {
            const { data: userData, error: userError } = await (supabase as any)
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

            return { ...article, profiles: userData };
          } catch (err) {
            console.warn(
              `Error processing user for article ${article.id}:`,
              err
            );
            return { ...article, profiles: null };
          }
        })
      );

      // If we have fewer than 6 articles, duplicate them to ensure smooth scrolling
      let finalArticles = [...articlesWithUserInfo];
      if (finalArticles.length < 6) {
        // Duplicate the articles to ensure we have enough for scrolling
        while (finalArticles.length < 12) {
          finalArticles = [...finalArticles, ...articlesWithUserInfo];
        }
      }

      setArticles(finalArticles);
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
    <div
      className="auto-scrolling-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollContainerRef}
        className="auto-scrolling-inner flex space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
