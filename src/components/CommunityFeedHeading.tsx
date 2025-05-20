// src/components/CommunityFeedHeading.tsx
"use client";

import Link from "next/link";

export default function CommunityFeedHeading() {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Community Articles</h2>
        <p className="text-gray-600">Latest articles from our writers</p>
      </div>
      <Link
        href="/feed"
        className="text-red-800 hover:text-red-600 font-medium flex items-center"
      >
        View All
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
}
