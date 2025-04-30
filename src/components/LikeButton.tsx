// src/components/LikeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface LikeButtonProps {
  articleId: string;
  initialLikeCount?: number;
  className?: string;
}

export default function LikeButton({
  articleId,
  initialLikeCount = 0,
  className = "",
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingLike, setCheckingLike] = useState(true);

  // Check if user has already liked this article
  useEffect(() => {
    async function checkIfLiked() {
      if (!user) {
        setCheckingLike(false);
        return;
      }

      try {
        setCheckingLike(true);

        // Using type cast to any to avoid TypeScript errors
        const { data, error } = await (supabase as any)
          .from("likes")
          .select("id")
          .eq("article_id", articleId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        setIsLiked(!!data);
      } catch (error) {
        console.error("Error checking like status:", error);
      } finally {
        setCheckingLike(false);
      }
    }

    checkIfLiked();
  }, [user, articleId]);

  // Function to handle like/unlike
  async function handleLikeToggle() {
    if (!user) {
      // Redirect to sign in page
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        // Using type cast to any to avoid TypeScript errors
        const { error } = await (supabase as any)
          .from("likes")
          .delete()
          .eq("article_id", articleId)
          .eq("user_id", user.id);

        if (error) throw error;

        setLikeCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        // Using type cast to any to avoid TypeScript errors
        const { error } = await (supabase as any).from("likes").insert({
          article_id: articleId,
          user_id: user.id,
        });

        if (error) throw error;

        // Try to create a notification for the article owner
        try {
          // Fetch article owner id to create notification
          const { data: articleData, error: articleError } = await (
            supabase as any
          )
            .from("public_articles")
            .select("user_id")
            .eq("id", articleId)
            .single();

          if (!articleError && articleData) {
            // Only create notification if the article owner isn't the current user
            if (articleData.user_id !== user.id) {
              // Create a notification for the article owner
              const { error: notificationError } = await (supabase as any)
                .from("notifications")
                .insert({
                  user_id: articleData.user_id,
                  action_type: "like",
                  action_user_id: user.id,
                  article_id: articleId,
                  created_at: new Date().toISOString(),
                  is_read: false,
                });

              if (notificationError) {
                console.error(
                  "Error creating like notification:",
                  notificationError
                );
                // Continue even if notification creation fails
              }
            }
          }
        } catch (notifyError) {
          // Log but don't prevent the like action from completing
          console.error("Error with notification:", notifyError);
        }

        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || checkingLike}
      className={`flex items-center space-x-2 transition-colors focus:outline-none ${
        isLiked
          ? "text-red-600 dark:text-red-500"
          : "text-gray-600 dark:text-gray-400"
      } ${className} ${
        isLoading || checkingLike
          ? "opacity-50 cursor-not-allowed"
          : "hover:text-red-500"
      }`}
      aria-label={isLiked ? "Unlike this article" : "Like this article"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 transition-transform ${
          isLiked ? "scale-110 fill-current" : "fill-none"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isLiked ? "1" : "2"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>
        {likeCount} {likeCount === 1 ? "Like" : "Likes"}
      </span>

      {checkingLike && (
        <span className="animate-pulse h-2 w-2 bg-gray-400 rounded-full"></span>
      )}
    </button>
  );
}
