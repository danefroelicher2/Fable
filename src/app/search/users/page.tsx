"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FollowButton from "@/components/FollowButton";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  article_count?: number;
}

export default function SearchUsersPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      searchUsers(query);
    } else {
      fetchSuggestedUsers();
    }
  }, [query]);

  // Search for users matching the query
  const searchUsers = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      // Search for users by username or full name
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) {
        throw error;
      }

      // For each user, get a count of their articles
      const usersWithArticleCounts = await Promise.all(
        (data || []).map(async (profile: UserProfile) => {
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

      setSearchResults(sortedUsers);
    } catch (err: any) {
      console.error("Error searching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggested users (used when no search query provided)
  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get counts of articles by user, grouped by user_id
      // Use a simplified approach to avoid complex queries
      const { data: articleCounts, error: countsError } = await (
        supabase as any
      )
        .from("public_articles")
        .select("user_id, count", { count: "exact", head: false })
        .eq("is_published", true)
        .limit(30);

      if (countsError) throw countsError;

      // If no articles found, get some random users instead
      if (!articleCounts || articleCounts.length === 0) {
        const { data: randomUsers, error: randomError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .limit(20);

        if (randomError) throw randomError;

        // Set article count to 0 for all users
        const usersWithZeroCounts = (randomUsers || []).map((user) => ({
          ...user,
          article_count: 0,
        }));

        setSearchResults(usersWithZeroCounts);
        return;
      }

      // Create a map of user IDs to article counts
      const userArticleCountMap: Record<string, number> = {};
      const userIds: string[] = [];

      articleCounts.forEach((item: any) => {
        userIds.push(item.user_id);
        userArticleCountMap[item.user_id] = parseInt(item.count);
      });

      // Get the user profiles for these users
      const { data: userProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Join the profiles with their article counts and sort
      const usersWithCounts = userProfiles
        .map((profile: UserProfile) => ({
          ...profile,
          article_count: userArticleCountMap[profile.id] || 0,
        }))
        .sort((a, b) => (b.article_count || 0) - (a.article_count || 0));

      setSearchResults(usersWithCounts);
    } catch (err: any) {
      console.error("Error fetching suggested users:", err);
      setError(err.message || "Failed to load suggested users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : "Discover Users"}
          </h1>
          <p className="text-gray-600">
            {query
              ? "Find users matching your search query"
              : "Discover interesting writers in the community"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form
            action="/search-users"
            method="get"
            className="flex items-center"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search users by name or username..."
              className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">
            {query ? `Users matching "${query}"` : "Active Community Members"}
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
          ) : error ? (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              <p>Error: {error}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {query
                  ? `No users found matching "${query}"`
                  : "No active users found"}
              </p>
              <Link
                href="/search"
                className="text-blue-600 hover:text-blue-800"
              >
                Try a different search
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <div key={user.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/user/${user.id}`}
                      className="flex items-center group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {(user.full_name || user.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-blue-600">
                          {user.full_name || user.username || "Anonymous User"}
                        </div>
                        {user.username && (
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {user.article_count}{" "}
                      {user.article_count === 1 ? "article" : "articles"}
                    </div>
                    <FollowButton targetUserId={user.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && !query && (
            <div className="mt-6 text-center">
              <Link href="/feed" className="text-blue-600 hover:text-blue-800">
                Browse Community Feed
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
