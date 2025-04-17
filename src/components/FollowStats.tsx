// src/components/FollowStats.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface FollowStatsProps {
  userId: string;
  className?: string;
  onStatsLoaded?: (followers: number, following: number) => void;
}

export default function FollowStats({
  userId,
  className = "",
  onStatsLoaded,
}: FollowStatsProps) {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFollowModal, setShowFollowModal] = useState<
    "followers" | "following" | null
  >(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

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
    try {
      setLoadingList(true);
      setFollowList([]);

      let query;
      if (type === "followers") {
        // Get all users who follow this user (with profile info)
        query = (supabase as any)
          .from("follows")
          .select(
            `
            follower_id,
            profiles!follower_id(id, username, full_name, avatar_url)
          `
          )
          .eq("following_id", userId);
      } else {
        // Get all users this user follows (with profile info)
        query = (supabase as any)
          .from("follows")
          .select(
            `
            following_id,
            profiles!following_id(id, username, full_name, avatar_url)
          `
          )
          .eq("follower_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to get the profile info
      const profiles = data.map((item: any) =>
        type === "followers" ? item.profiles : item.profiles
      );

      setFollowList(profiles);
    } catch (err) {
      console.error(`Error fetching ${type} list:`, err);
    } finally {
      setLoadingList(false);
    }
  }

  const openModal = async (type: "followers" | "following") => {
    setShowFollowModal(type);
    await fetchFollowList(type);
  };

  const closeModal = () => {
    setShowFollowModal(null);
    setFollowList([]);
  };

  // Modal component for displaying followers/following
  const FollowModal = () => {
    if (!showFollowModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {showFollowModal === "followers" ? "Followers" : "Following"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
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
                <p className="mt-2">Loading...</p>
              </div>
            ) : followList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {showFollowModal === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </div>
            ) : (
              <ul className="divide-y">
                {followList.map((profile) => (
                  <li key={profile.id} className="p-4 hover:bg-gray-50">
                    <a
                      href={`/user/${profile.id}`}
                      className="flex items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username || "User"}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="text-gray-600">
                            {(profile.username || profile.full_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {profile.full_name ||
                            profile.username ||
                            "Anonymous User"}
                        </div>
                        {profile.username && (
                          <div className="text-sm text-gray-500">
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

  return (
    <div className={`flex space-x-6 ${className}`}>
      <button
        onClick={() => openModal("followers")}
        className="flex flex-col items-center hover:opacity-80 transition-opacity"
      >
        <span className="font-bold text-lg">
          {loading ? "-" : followerCount}
        </span>
        <span className="text-gray-600 text-sm">Followers</span>
      </button>

      <button
        onClick={() => openModal("following")}
        className="flex flex-col items-center hover:opacity-80 transition-opacity"
      >
        <span className="font-bold text-lg">
          {loading ? "-" : followingCount}
        </span>
        <span className="text-gray-600 text-sm">Following</span>
      </button>

      {/* Modal for showing followers/following lists */}
      <FollowModal />
    </div>
  );
}
