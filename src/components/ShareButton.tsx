// src/components/ShareButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ShareViaMessage from "./ShareViaMessage";

interface ShareButtonProps {
  articleId?: string;
  postId?: string;
  articleSlug?: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ShareButton({
  articleId,
  postId,
  articleSlug,
  title,
  size = "md",
  className = "",
}: ShareButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate share URL
  const getShareUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (articleSlug) {
      return `${baseUrl}/articles/${articleSlug}`;
    } else if (postId) {
      return `${baseUrl}/posts/${postId}`;
    }
    return baseUrl;
  };

  // Button size classes
  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Handle sharing actions
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      // You could show a toast notification here
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = (platform: string) => {
    const url = getShareUrl();
    const text = `Check out this article: ${title}`;

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "reddit":
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setIsDropdownOpen(false);
  };

  // Position dropdown to stay within viewport
  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // If button is too close to the left edge, align dropdown to the right
    if (buttonRect.left < 200) {
      return {
        left: 0,
        right: "auto",
      };
    }
    // If button is too close to the right edge, align dropdown to the left
    else if (buttonRect.right > viewportWidth - 200) {
      return {
        right: 0,
        left: "auto",
      };
    }
    // Default center alignment
    else {
      return {
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Share Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${sizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors`}
        aria-label="Share"
      >
        <svg
          className={iconSizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      </button>

      {/* Dropdown Menu - CLEANED UP */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-48"
          style={getDropdownPosition()}
        >
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
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
            Copy Link
          </button>

          {/* Send via Direct Message - ONE LINE */}
          <button
            onClick={() => {
              setIsMessageModalOpen(true);
              setIsDropdownOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="whitespace-nowrap">Send via Direct Message</span>
          </button>
        </div>
      )}

      {/* Share via Message Modal */}
      <ShareViaMessage
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        shareUrl={getShareUrl()}
        title={title}
        articleId={articleId}
        postId={postId}
      />
    </div>
  );
}
