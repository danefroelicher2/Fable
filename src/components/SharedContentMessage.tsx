// src/components/SharedContentMessage.tsx
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
    <div
      className={`bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 ${className}`}
    >
      {/* Personal message if provided */}
      {personalMessage &&
        personalMessage !== `Shared: ${sharedContent.title}` && (
          <div className="text-gray-700 mb-3">{personalMessage}</div>
        )}

      {/* Shared content card */}
      <Link
        href={sharedContent.url}
        className="block hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex">
          {/* Content image */}
          {sharedContent.image_url && (
            <div className="w-20 h-20 bg-gray-200 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
              <img
                src={sharedContent.image_url}
                alt={sharedContent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content details */}
          <div className="flex-1 min-w-0">
            {/* Content type badge */}
            <div className="flex items-center mb-2">
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

            {/* Title */}
            <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
              {sharedContent.title}
            </h4>

            {/* Author */}
            {sharedContent.author && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <div className="w-5 h-5 rounded-full bg-gray-300 mr-2 overflow-hidden flex-shrink-0">
                  {sharedContent.author.avatar_url ? (
                    <img
                      src={sharedContent.author.avatar_url}
                      alt={sharedContent.author.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
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
                <span>
                  by{" "}
                  {sharedContent.author.full_name ||
                    sharedContent.author.username ||
                    "Anonymous"}
                </span>
              </div>
            )}

            {/* Excerpt */}
            {sharedContent.excerpt && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {sharedContent.excerpt}
              </p>
            )}

            {/* Date */}
            {sharedContent.published_at && (
              <div className="text-xs text-gray-500">
                {formatDate(sharedContent.published_at)}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Call to action */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Link
          href={sharedContent.url}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View {sharedContent.type === "article" ? "Article" : "Post"}
          <svg
            className="w-4 h-4 ml-1"
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
        </Link>
      </div>
    </div>
  );
}
