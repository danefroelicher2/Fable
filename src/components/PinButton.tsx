// src/components/PinButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  isArticlePinned,
  togglePinnedPost,
  getUserPinnedPosts,
} from "@/lib/pinnedPostUtils";

interface PinButtonProps {
  articleId: string;
  className?: string;
  showLabel?: boolean;
}

export default function PinButton({
  articleId,
  className = "",
  showLabel = true,
}: PinButtonProps) {
  const { user } = useAuth();
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkPinStatus();
    }
  }, [user, articleId]);

  const checkPinStatus = () => {
    if (!user) return;

    try {
      const pinned = isArticlePinned(user.id, articleId);
      setIsPinned(pinned);
    } catch (err) {
      console.error("Error checking pin status:", err);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any parent link navigation
    e.stopPropagation();

    if (!user || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentPinnedPosts = getUserPinnedPosts(user.id);

      // Check if trying to pin when already at maximum
      if (!isPinned && currentPinnedPosts.length >= 4) {
        setError("You can only pin up to 4 articles");
        setTimeout(() => setError(null), 3000);
        return;
      }

      const success = togglePinnedPost(user.id, articleId);

      if (success) {
        setIsPinned(!isPinned);

        // Show success feedback briefly
        if (!isPinned) {
          // Just pinned
          setTimeout(() => {
            // Could add success toast here if needed
          }, 100);
        }
      } else {
        if (!isPinned && currentPinnedPosts.length >= 4) {
          setError("Maximum of 4 pinned articles reached");
        } else {
          setError("Failed to update pin status");
        }
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error toggling pin:", err);
      setError("An error occurred");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no user (not authenticated)
  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleTogglePin}
        disabled={isLoading}
        className={`flex items-center text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 ${className}`}
        title={isPinned ? "Unpin from profile" : "Pin to profile"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${showLabel ? "mr-1" : ""} ${
            isPinned ? "text-blue-600" : ""
          }`}
          fill={isPinned ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        {showLabel && (
          <span className="text-sm">
            {isLoading ? "..." : isPinned ? "Pinned" : "Pin"}
          </span>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap z-10">
          {error}
          <div className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>
      )}
    </div>
  );
}
