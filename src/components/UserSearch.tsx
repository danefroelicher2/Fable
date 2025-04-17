// src/components/UserSearch.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import FollowButton from "@/components/FollowButton";
interface SearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Searching for users with term:", searchTerm);

      // First try to search by username
      const { data: usernameResults, error: usernameError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("username", `%${searchTerm}%`)
        .limit(5);

      if (usernameError) throw usernameError;

      // Then try to search by full name
      const { data: nameResults, error: nameError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("full_name", `%${searchTerm}%`)
        .limit(5);

      if (nameError) throw nameError;

      // Combine and deduplicate results
      const combined = [...(usernameResults || []), ...(nameResults || [])];
      const uniqueResults = Array.from(
        new Map(combined.map((item) => [item.id, item])).values()
      );

      console.log(
        `Found ${uniqueResults.length} users matching "${searchTerm}"`
      );
      setResults(uniqueResults);
    } catch (err: any) {
      console.error("Error searching users:", err);
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    console.log("Navigating to user profile:", userId);
    // Navigate to the new user profile route
    router.push(`/user/${userId}`);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search users by name or username"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {results.map((userResult) => (
              <li
                key={userResult.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleUserClick(userResult.id)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 overflow-hidden">
                      {userResult.avatar_url ? (
                        <img
                          src={userResult.avatar_url}
                          alt={userResult.username || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {(userResult.full_name || userResult.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {userResult.full_name ||
                          userResult.username ||
                          "Anonymous User"}
                      </p>
                      {userResult.username && (
                        <p className="text-sm text-gray-500">
                          @{userResult.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Only show follow button if the current user is not the result user */}
                  {user && user.id !== userResult.id && (
                    <FollowButton
                      targetUserId={userResult.id}
                      className="self-center ml-2 text-xs px-3 py-1"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.length === 0 && searchTerm && !loading && (
        <div className="text-center py-4 text-gray-500">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
