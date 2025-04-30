// src/components/FollowButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { setupNotificationsTable } from "@/lib/setupDatabase";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUserId,
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingFollowStatus, setCheckingFollowStatus] = useState(true);

  // Check if user is already following the target user
  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !targetUserId) {
        setCheckingFollowStatus(false);
        return;
      }

      // Don't show follow button for own profile
      if (user.id === targetUserId) {
        setCheckingFollowStatus(false);
        return;
      }

      try {
        setCheckingFollowStatus(true);

        const { data, error } = await (supabase as any)
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .maybeSingle();

        if (error) throw error;

        setIsFollowing(!!data);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setCheckingFollowStatus(false);
      }
    }

    checkFollowStatus();
  }, [user, targetUserId]);

  async function handleFollowToggle() {
    if (!user) {
      // Redirect to sign in page
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (isLoading || checkingFollowStatus) return;

    // Don't allow following yourself
    if (user.id === targetUserId) {
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await (supabase as any)
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false);
      } else {
        // Follow
        const { error } = await (supabase as any).from("follows").insert({
          follower_id: user.id,
          following_id: targetUserId,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        // Try to create a notification
        try {
          const notificationData = {
            user_id: targetUserId,
            action_type: "follow",
            action_user_id: user.id,
            created_at: new Date().toISOString(),
            is_read: false,
            article_id: null,
            comment_id: null,
          };

          // Try to insert notification
          const { data, error: notificationError } = await (supabase as any)
            .from("notifications")
            .insert(notificationData);

          // If we get an error, check if it's because the table doesn't exist
          if (notificationError) {
            console.error(
              "Error creating notification:",
              notificationError.message || JSON.stringify(notificationError)
            );

            // Check if the notifications table exists
            const tableStatus = await setupNotificationsTable();

            if (!tableStatus.success) {
              console.warn(tableStatus.message);
            }
          } else {
            console.log("Notification created successfully");
          }
        } catch (notifyError) {
          console.warn("Exception when creating notification:", notifyError);
        }

        setIsFollowing(true);
        if (onFollowChange) onFollowChange(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render button if it's the user's own profile or if we're still checking
  if (user?.id === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading || checkingFollowStatus}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isFollowing
          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${
        isLoading || checkingFollowStatus ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {isFollowing ? "Unfollowing..." : "Following..."}
        </span>
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
}
