// src/components/FollowStats.tsx - ENHANCED WITH CLICKABLE FUNCTIONALITY
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface FollowStatsProps {
  userId: string;
  className?: string;
  displayFormat?: "raw" | "inline" | "stacked";
  onStatsLoaded?: (followers: number, following: number) => void;
}

interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function FollowStats({
  userId,
  className = "",
  displayFormat = "stacked",
  onStatsLoaded,
}: FollowStatsProps) {
  const { user } = useAuth(); // Get current user for comparison
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFollowModal, setShowFollowModal] = useState<
    "followers" | "following" | null
  >(null);
  const [followList, setFollowList] = useState<ProfileData[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // NEW: Check if this is the current user's profile
  const isCurrentUser = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchFollowStats();
    }
  }, [userId]);

  async function fetchFollowStats() {
    try {
      setLoading(true);
      setError("");

      // Get followers count (people who follow this user)
      const { count: followersCount, error: followersError } = await (
        supabase as any
      )
        .from("follows")
        .select("id", { count: "exact" })
        .eq("following_id", userId);

      if (followersError) throw followersError;

      // Get following count (people this user follows)
      const { count: followingCountData, error: followingError } = await (
        supabase as any
      )
        .from("follows")
        .select("id", { count: "exact" })
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      setFollowerCount(followersCount || 0);
      setFollowingCount(followingCountData || 0);

      if (onStatsLoaded) {
        onStatsLoaded(followersCount || 0, followingCountData || 0);
      }
    } catch (err) {
      console.error("Error fetching follow stats:", err);
      setError("Failed to load follow statistics");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowList(type: "followers" | "following") {
    // SECURITY: Only allow current user to view their lists
    if (!isCurrentUser) {
      console.log("Access denied: Not current user");
      return;
    }

    try {
      setLoadingList(true);
      setFollowList([]);

      // First fetch the relevant user IDs
      let userIds: string[] = [];

      if (type === "followers") {
        // Get IDs of users who follow this user
        const { data: followerData, error: followerError } = await (
          supabase as any
        )
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);

        if (followerError) throw followerError;
        userIds = followerData.map((item: any) => item.follower_id);
      } else {
        // Get IDs of users this user follows
        const { data: followingData, error: followingError } = await (
          supabase as any
        )
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        if (followingError) throw followingError;
        userIds = followingData.map((item: any) => item.following_id);
      }

      // If we have user IDs, fetch their profile information
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        setFollowList(profilesData || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type} list:`, error);
    } finally {
      setLoadingList(false);
    }
  }

  // ENHANCED: Only open modal if current user
  const openModal = async (type: "followers" | "following") => {
    if (!isCurrentUser) {
      // Silent return - no action for other users
      console.log("Cannot view followers/following of other users");
      return;
    }

    setShowFollowModal(type);
    await fetchFollowList(type);
  };

  const closeModal = () => {
    setShowFollowModal(null);
    setFollowList([]);
  };

  // Raw display just for callbacks
  if (displayFormat === "raw") {
    return null;
  }

  // ENHANCED: Modal component for displaying followers/following
  const FollowModal = () => {
    if (!showFollowModal || !isCurrentUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-white">
              {showFollowModal === "followers" ? "Your Followers" : "Following"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-70px)]">
            {loadingList ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-2 dark:text-white">Loading...</p>
              </div>
            ) : followList.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {showFollowModal === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {followList.map((profile) => (
                  <li
                    key={profile.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <a
                      href={`/user/${profile.id}`}
                      className="flex items-center"
                      onClick={closeModal} // Close modal when clicking on user
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username || "User"}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300">
                            {(profile.username || profile.full_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {profile.full_name ||
                            profile.username ||
                            "Anonymous User"}
                        </div>
                        {profile.username && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{profile.username}
                          </div>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ENHANCED: Choose layout based on displayFormat
  if (displayFormat === "inline") {
    return (
      <div className={`flex space-x-6 ${className}`}>
        <button
          onClick={() => openModal("followers")}
          className={`flex flex-col items-center transition-opacity ${
            isCurrentUser ? "hover:opacity-80 cursor-pointer" : "cursor-default"
          }`}
          disabled={!isCurrentUser}
        >
          <span className="font-bold text-lg">
            {loading ? "-" : followerCount}
          </span>
          <span className="text-gray-600 text-sm">Followers</span>
        </button>

        <button
          onClick={() => openModal("following")}
          className={`flex flex-col items-center transition-opacity ${
            isCurrentUser ? "hover:opacity-80 cursor-pointer" : "cursor-default"
          }`}
          disabled={!isCurrentUser}
        >
          <span className="font-bold text-lg">
            {loading ? "-" : followingCount}
          </span>
          <span className="text-gray-600 text-sm">Following</span>
        </button>

        {/* Modal for showing followers/following lists - Only for current user */}
        {isCurrentUser && <FollowModal />}
      </div>
    );
  }

  // Default stacked layout
  return (
    <div className={`flex space-x-6 ${className}`}>
      <button
        onClick={() => openModal("followers")}
        className={`flex flex-col items-center transition-opacity ${
          isCurrentUser ? "hover:opacity-80 cursor-pointer" : "cursor-default"
        }`}
        disabled={!isCurrentUser}
        title={isCurrentUser ? "Click to view followers" : ""}
      >
        <span className="font-bold text-lg">
          {loading ? "-" : followerCount}
        </span>
        <span className="text-gray-600 text-sm">Followers</span>
      </button>

      <button
        onClick={() => openModal("following")}
        className={`flex flex-col items-center transition-opacity ${
          isCurrentUser ? "hover:opacity-80 cursor-pointer" : "cursor-default"
        }`}
        disabled={!isCurrentUser}
        title={isCurrentUser ? "Click to view following" : ""}
      >
        <span className="font-bold text-lg">
          {loading ? "-" : followingCount}
        </span>
        <span className="text-gray-600 text-sm">Following</span>
      </button>

      {/* Modal for showing followers/following lists - Only for current user */}
      {isCurrentUser && <FollowModal />}
    </div>
  );
}
