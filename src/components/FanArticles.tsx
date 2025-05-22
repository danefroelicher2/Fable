// src/components/FanArticles.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Original mock data as fallback
const mockArticles = [
  // Left column top
  {
    id: "f1",
    title:
      "KILLER INSTINCT: HOW ONE MAN TAUGHT U.S. RANGERS TO FIGHT DIRTY IN WWII",
    slug: "killer-instinct-rangers-wwii",
    category: "STORIES",
    categoryColor: "bg-red-600",
    excerpt:
      "The untold story of unconventional combat training that changed modern warfare.",
  },
  // Left column bottom
  {
    id: "f2",
    title:
      "HOW THIS SUBTERRANEAN LOGISTICS BASE IN AFGHANISTAN BEDEVILED SOVIET INVADERS",
    slug: "afghanistan-logistics-base-soviet",
    category: "FEATURE",
    categoryColor: "bg-red-600",
    excerpt:
      "The hidden mountain complex that helped turn the tide of the Soviet-Afghan War.",
  },
  // Center feature
  {
    id: "f3",
    title:
      "DON'T BLAME BILLY THE KID'S MOM FOR HIS OUTLAW LIFESTYLE—HE WAS ALWAYS GOING TO BE BAD",
    slug: "billy-the-kid-mother",
    category: "FEATURE",
    categoryColor: "bg-red-600",
    excerpt:
      "Catherine McCarty Antrim did all she could to protect and raise both of her sons—Billy, the future outlaw, and Joe, the future forgotten brother.",
    featured: true,
  },
  // Right column top
  {
    id: "f4",
    title:
      "YES, BUZZ ALDRIN WALKED ON THE MOON BUT WE ASKED HIM ABOUT HIS FIGHTER JOCK DAYS",
    slug: "buzz-aldrin-fighter-pilot",
    category: "INTERVIEW",
    categoryColor: "bg-red-600",
    excerpt:
      "The Apollo 11 astronaut's lesser-known career as a decorated combat pilot in Korea.",
  },
  // Right column bottom
  {
    id: "f5",
    title:
      "IF YOU LIKE THE B-17S IN MASTERS OF THE AIR, YOU'LL LOVE THESE MOVIES",
    slug: "b17-movies-masters-air",
    category: "STORIES",
    categoryColor: "bg-red-600",
    excerpt:
      "Classic films that capture the drama and danger of flying fortress missions.",
  },
];

export default function FanArticles() {
  const [loading, setLoading] = useState(true);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedArticles = async () => {
    try {
      setLoading(true);

      // Get featured articles from the database
      // Using type assertion to bypass TypeScript checking for featured_articles table
      const { data: featuredData, error: featuredError } = await (
        supabase as any
      )
        .from("featured_articles")
        .select(
          `
          position,
          article_id,
          article:public_articles(
            id,
            title,
            slug,
            excerpt,
            category,
            view_count,
            image_url,
            user_id
          )
        `
        )
        .order("position");

      if (featuredError) {
        console.error("Error fetching featured data:", featuredError);
        // Fallback to mock data if there's an error
        setFeaturedArticles(mockArticles);
        return;
      }

      // If no featured articles or empty result, use mock data
      if (!featuredData || featuredData.length === 0) {
        console.log("No featured articles found, using mock data");
        setFeaturedArticles(mockArticles);
        return;
      }

      // Transform data to match the expected format
      const transformedData = featuredData
        .filter((item: any) => item.article) // Filter out any null articles
        .map((item: any) => {
          const article = item.article;
          return {
            id: `f${item.position}`,
            title: article.title.toUpperCase(),
            slug: article.slug,
            excerpt: article.excerpt || "No excerpt available",
            category: article.category?.toUpperCase() || "FEATURE",
            categoryColor: "bg-red-600",
            image_url: article.image_url,
            featured: item.position === 3, // Middle position is featured
            articleId: article.id, // Store the original article ID
          };
        });

      // If we have less than 5 featured articles, fill with mock data
      const result = [...transformedData];

      if (result.length < 5) {
        // Determine which positions are missing
        const existingPositions = transformedData.map((item: any) =>
          parseInt(item.id.replace("f", ""))
        );

        for (let i = 1; i <= 5; i++) {
          if (!existingPositions.includes(i)) {
            // Add mock data for missing position
            const mockArticle = mockArticles.find((a) => a.id === `f${i}`);
            if (mockArticle) {
              result.push({
                ...mockArticle,
                title: `FEATURED SLOT ${i} AVAILABLE`,
                excerpt: `This featured slot is currently available.`,
              });
            }
          }
        }
      }

      // Sort by position
      result.sort((a, b) => {
        const posA = parseInt(a.id.replace("f", ""));
        const posB = parseInt(b.id.replace("f", ""));
        return posA - posB;
      });

      setFeaturedArticles(result);
    } catch (err) {
      console.error("Error processing featured articles:", err);
      // Fallback to mock data
      setFeaturedArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedArticles();

    // Set up realtime subscription for updates
    // Using type assertion for the channel subscription as well
    const channel = (supabase as any)
      .channel("featured-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "featured_articles",
        },
        () => {
          console.log("Featured articles changed, refreshing...");
          fetchFeaturedArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featuredArticle = featuredArticles.find((article) => article.featured);
  const sideArticles = featuredArticles.filter((article) => !article.featured);

  // Split side articles for left and right columns
  const leftColumnArticles = sideArticles.slice(0, 2);
  const rightColumnArticles = sideArticles.slice(2);

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Fan Articles
          </h2>
          <Link
            href="/contribute"
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
          >
            Submit Your Story
          </Link>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Fan Articles
        </h2>
        <Link
          href="/contribute"
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
        >
          Submit Your Story
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="md:col-span-3 space-y-6">
          {leftColumnArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div className="relative">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 mb-3">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      [Featured Image]
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 right-0">
                  <span
                    className={`bg-red-600 text-white px-3 py-1 text-sm font-medium`}
                  >
                    {article.category}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 leading-tight uppercase px-2">
                <Link
                  href={article.slug ? `/articles/${article.slug}` : "#"}
                  className={`text-gray-900 dark:text-gray-100 ${
                    article.slug
                      ? "hover:text-red-600 dark:hover:text-red-400"
                      : "cursor-default"
                  }`}
                >
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm px-2 pb-2">
                {article.excerpt}
              </p>
            </div>
          ))}
        </div>

        {/* Center featured article */}
        {featuredArticle && (
          <div className="md:col-span-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden h-full">
              <div className="relative">
                <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 mb-3">
                  {featuredArticle.image_url ? (
                    <img
                      src={featuredArticle.image_url}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      [Featured Image]
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 right-0">
                  <span
                    className={`bg-red-600 text-white px-4 py-1 text-sm font-medium`}
                  >
                    {featuredArticle.category}
                  </span>
                </div>
              </div>
              <div className="px-3 pb-3">
                <h3 className="text-2xl font-bold mb-3 leading-tight uppercase">
                  <Link
                    href={
                      featuredArticle.slug
                        ? `/articles/${featuredArticle.slug}`
                        : "#"
                    }
                    className={`text-gray-900 dark:text-gray-100 ${
                      featuredArticle.slug
                        ? "hover:text-red-600 dark:hover:text-red-400"
                        : "cursor-default"
                    }`}
                  >
                    {featuredArticle.title}
                  </Link>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {featuredArticle.excerpt}
                </p>
                {featuredArticle.slug && (
                  <Link
                    href={`/articles/${featuredArticle.slug}`}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Read on
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="md:col-span-3 space-y-6">
          {rightColumnArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div className="relative">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 mb-3">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      [Featured Image]
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 right-0">
                  <span
                    className={`bg-red-600 text-white px-3 py-1 text-sm font-medium`}
                  >
                    {article.category}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 leading-tight uppercase px-2">
                <Link
                  href={article.slug ? `/articles/${article.slug}` : "#"}
                  className={`text-gray-900 dark:text-gray-100 ${
                    article.slug
                      ? "hover:text-red-600 dark:hover:text-red-400"
                      : "cursor-default"
                  }`}
                >
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm px-2 pb-2">
                {article.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
