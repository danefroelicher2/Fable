"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import UserSearch from "@/components/UserSearch";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext"; // ADD THIS

interface SuggestedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  article_count?: number;
}

export default function SearchUsersPage() {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch some suggested users to follow
    if (user) {
      fetchSuggestedUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchSuggestedUsers() {
    try {
      setLoading(true);

      // First get users the current user is already following
      const { data: followingData, error: followingError } = await (
        supabase as any
      )
        .from("follows")
        .select("following_id")
        .eq("follower_id", user?.id || "");

      if (followingError) throw followingError;

      // Extract the following IDs
      const followingIds = followingData
        ? followingData.map(
            (follow: { following_id: string }) => follow.following_id
          )
        : [];

      // Add the current user's ID to exclude
      const excludeIds = [...followingIds];
      if (user?.id) {
        excludeIds.push(user.id);
      }

      // Build query to find users who have published articles
      // and are not already followed
      let query = (supabase as any).from("profiles").select(
        `
          id, 
          username, 
          full_name, 
          avatar_url
        `
      );

      // If there are users to exclude, add that condition
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      // Execute the query and limit results
      const { data, error } = await query.limit(6);

      if (error) throw error;

      // For each user, get a count of their articles
      const usersWithArticleCounts = await Promise.all(
        (data || []).map(async (profile: SuggestedUser) => {
          try {
            const { count, error: countError } = await (supabase as any)
              .from("public_articles")
              .select("id", { count: "exact" })
              .eq("user_id", profile.id)
              .eq("is_published", true);

            if (countError) throw countError;

            return {
              ...profile,
              article_count: count || 0,
            };
          } catch (err) {
            console.error(
              `Error getting article count for ${profile.id}:`,
              err
            );
            return {
              ...profile,
              article_count: 0,
            };
          }
        })
      );

      // Sort by article count (most prolific authors first)
      const sortedUsers = usersWithArticleCounts.sort(
        (a, b) => (b.article_count || 0) - (a.article_count || 0)
      );

      setSuggestedUsers(sortedUsers);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // If a user is now followed, remove them from suggestions
    if (isFollowing) {
      setSuggestedUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme === "dark" ? "white" : "black" }}
          >
            Find Users to Follow
          </h1>
          <p className="text-gray-600">
            Search for users by name or username, or check out our suggestions
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: theme === "dark" ? "black" : "black" }}
          >
            Search Users
          </h2>
          <UserSearch />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: theme === "dark" ? "black" : "black" }}
          >
            Suggested Users to Follow
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg animate-pulse"
                >
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                </div>
              ))}
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No suggested users available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedUsers.map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/user/${suggestedUser.id}`}
                      className="flex items-center group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 overflow-hidden">
                        {suggestedUser.avatar_url ? (
                          <img
                            src={suggestedUser.avatar_url}
                            alt={suggestedUser.username || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {(
                              suggestedUser.full_name ||
                              suggestedUser.username ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-blue-600">
                          {suggestedUser.full_name ||
                            suggestedUser.username ||
                            "Anonymous User"}
                        </div>
                        {suggestedUser.username && (
                          <div className="text-sm text-gray-500">
                            @{suggestedUser.username}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {suggestedUser.article_count}{" "}
                      {suggestedUser.article_count === 1
                        ? "article"
                        : "articles"}
                    </div>
                    <FollowButton
                      targetUserId={suggestedUser.id}
                      onFollowChange={(isFollowing) =>
                        handleFollowChange(suggestedUser.id, isFollowing)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && suggestedUsers.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={fetchSuggestedUsers}
                className="text-blue-600 hover:text-blue-800"
              >
                Refresh Suggestions
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Link href="/following" className="text-blue-600 hover:text-blue-800">
            ← Back to Following Feed
          </Link>
          <Link href="/feed" className="text-blue-600 hover:text-blue-800">
            Browse Community Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
