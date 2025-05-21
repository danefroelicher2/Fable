// src/components/CommunityFeedHeading.tsx
"use client";

import Link from "next/link";

export default function CommunityFeedHeading() {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trending
        </h2>
      </div>
      <Link
        href="/feed"
        className="text-red-800 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
      >
        View All
      </Link>
    </div>
  );
}
