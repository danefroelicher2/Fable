// src/components/ShareButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ShareViaMessage from "./ShareViaMessage";

interface ShareButtonProps {
  articleId?: string;
  postId?: string;
  articleSlug?: string;
  title: string;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ShareButton({
  articleId,
  postId,
  articleSlug,
  title,
  className = "",
  showLabel = true,
  size = "md",
}: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const shareUrl = articleSlug
    ? `${window.location.origin}/articles/${articleSlug}`
    : `${window.location.origin}/posts/${postId}`;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const handleShareViaMessage = () => {
    setShowShareMenu(false);
    setShowMessageModal(true);
  };

  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className="relative" ref={shareMenuRef}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className={`flex items-center text-gray-600 hover:text-blue-600 transition-colors ${className}`}
        title="Share this article"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} ${showLabel ? "mr-1" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        {showLabel && <span className={textSize}>Share</span>}
      </button>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          <div className="space-y-1">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={handleShareViaMessage}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Send Message
            </button>

            <button
              onClick={() => {
                // Updated Twitter sharing format - just the URL for better card display
                const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(title)}`;
                window.open(twitterUrl, "_blank");
                setShowShareMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
          </div>
        </div>
      )}

      {/* Share via Message Modal */}
      <ShareViaMessage
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        shareUrl={shareUrl}
        title={title}
        articleId={articleId}
        postId={postId}
      />
    </div>
  );
}
