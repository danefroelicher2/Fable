// src/components/SharedContentMessage.tsx - ENHANCED VERSION
"use client";

import Link from "next/link";
import { SharedContent } from "@/lib/SharedContentUtils";

interface SharedContentMessageProps {
  sharedContent: SharedContent;
  personalMessage?: string;
  className?: string;
}

export default function SharedContentMessage({
  sharedContent,
  personalMessage,
  className = "",
}: SharedContentMessageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`max-w-sm ${className}`}>
      {/* Personal message if provided and different from default */}
      {personalMessage && personalMessage.trim() && (
        <div className="text-white mb-2 text-sm">{personalMessage}</div>
      )}

      {/* Shared content card */}
      <Link
        href={sharedContent.url}
        className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* Cover Image */}
        <div className="relative h-32 bg-gray-200">
          {sharedContent.image_url ? (
            <img
              src={sharedContent.image_url}
              alt={sharedContent.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}

          {/* Content type badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {sharedContent.type === "article" ? (
                <>
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"
                    />
                  </svg>
                  Article
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8V4a2 2 0 012 2v2z"
                    />
                  </svg>
                  Post
                </>
              )}
            </span>
          </div>

          {/* External link indicator */}
          <div className="absolute top-2 right-2">
            <div className="bg-white bg-opacity-90 rounded-full p-1">
              <svg
                className="w-3 h-3 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content details */}
        <div className="p-3">
          {/* Title */}
          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm leading-tight">
            {sharedContent.title}
          </h4>

          {/* Author info */}
          {sharedContent.author && (
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <div className="w-4 h-4 rounded-full bg-gray-300 mr-2 overflow-hidden flex-shrink-0">
                {sharedContent.author.avatar_url ? (
                  <img
                    src={sharedContent.author.avatar_url}
                    alt={sharedContent.author.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    {(
                      sharedContent.author.full_name ||
                      sharedContent.author.username ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <span className="truncate">
                by{" "}
                {sharedContent.author.full_name ||
                  sharedContent.author.username ||
                  "Anonymous"}
              </span>
            </div>
          )}

          {/* Excerpt */}
          {sharedContent.excerpt && (
            <p className="text-gray-600 text-xs line-clamp-2 mb-2">
              {sharedContent.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center">
            {/* Date */}
            {sharedContent.published_at && (
              <div className="text-xs text-gray-500">
                {formatDate(sharedContent.published_at)}
              </div>
            )}

            {/* Read more indicator */}
            <div className="text-xs text-blue-600 font-medium flex items-center">
              Read more
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
