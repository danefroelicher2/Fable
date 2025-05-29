// src/components/ShareButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ShareViaMessage from "./SharedViaMessage";

interface ShareButtonProps {
  articleId?: string;
  postId?: string;
  articleSlug?: string;
  title: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "text" | "both";
}

export default function ShareButton({
  articleId,
  postId,
  articleSlug,
  title,
  className = "",
  size = "md",
  variant = "icon",
}: ShareButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate the share URL
  const getShareUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    if (articleSlug) {
      return `${baseUrl}/articles/${articleSlug}`;
    } else if (postId) {
      // For community posts, we'll need to get the community ID
      // For now, we'll use a generic posts URL
      return `${baseUrl}/posts/${postId}`;
    }

    return baseUrl;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);

      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setIsOpen(false);
      }, 2000);
    }
  };

  // Handle direct message sharing
  const handleDirectMessage = () => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = `/signin?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }
    setShowMessageModal(true);
    setIsOpen(false);
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Button size classes
  const buttonSizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Share Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-center
            ${buttonSizeClasses[size]}
            text-gray-600 hover:text-gray-800 
            hover:bg-gray-100 rounded-full 
            transition-colors duration-200
            dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
          `}
          aria-label="Share post"
          title="Share"
        >
          <svg
            className={iconSizeClasses[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 101.053-2.684 3 3 0 00-1.053 2.684z"
            />
          </svg>
          {variant === "text" && <span className="ml-2">Share</span>}
          {variant === "both" && <span className="ml-2">Share</span>}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 dark:bg-gray-800 dark:border-gray-700">
            {/* Copy Link Option */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center dark:hover:bg-gray-700"
            >
              <svg
                className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {copySuccess ? "Copied!" : "Copy Link"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {copySuccess
                    ? "Link copied to clipboard"
                    : "Copy link to share anywhere"}
                </div>
              </div>
              {copySuccess && (
                <svg
                  className="h-5 w-5 ml-auto text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Send via Direct Message Option */}
            <button
              onClick={handleDirectMessage}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center dark:hover:bg-gray-700"
            >
              <svg
                className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                />
              </svg>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Send via Direct Message
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Share with someone directly
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Share via Message Modal */}
      {showMessageModal && (
        <ShareViaMessage
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          shareUrl={getShareUrl()}
          title={title}
          articleId={articleId}
          postId={postId}
        />
      )}
    </>
  );
}
