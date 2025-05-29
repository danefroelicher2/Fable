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

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-48"
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

          {/* Send via Direct Message */}
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
            Send via Direct Message
          </button>

          <div className="border-t border-gray-100 my-1"></div>

          {/* Social Media Options */}
          <button
            onClick={() => handleShare("twitter")}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>

          <button
            onClick={() => handleShare("facebook")}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            Share on Facebook
          </button>

          <button
            onClick={() => handleShare("linkedin")}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
            Share on LinkedIn
          </button>

          <button
            onClick={() => handleShare("reddit")}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
            Share on Reddit
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
