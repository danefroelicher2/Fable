// src/components/CommunityFeedHeading.tsx
"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function CommunityFeedHeading() {
  const { theme } = useTheme();

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2
          className="text-3xl font-bold"
          style={{ color: theme === "dark" ? "white" : "black" }}
        >
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
