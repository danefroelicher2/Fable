// src/components/FanArticles.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data for fan articles
const fanArticles = [
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
  const featuredArticle = fanArticles.find((article) => article.featured);
  const sideArticles = fanArticles.filter((article) => !article.featured);

  // Split side articles for left and right columns
  const leftColumnArticles = sideArticles.slice(0, 2);
  const rightColumnArticles = sideArticles.slice(2);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Featured
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
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    [Featured Image]
                  </div>
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
                  href={`/fan-articles/${article.slug}`}
                  className="text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400"
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
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    [Featured Image]
                  </div>
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
                    href={`/fan-articles/${featuredArticle.slug}`}
                    className="text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400"
                  >
                    {featuredArticle.title}
                  </Link>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {featuredArticle.excerpt}
                </p>
                <Link
                  href={`/fan-articles/${featuredArticle.slug}`}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Read on
                </Link>
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
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    [Featured Image]
                  </div>
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
                  href={`/fan-articles/${article.slug}`}
                  className="text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400"
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
