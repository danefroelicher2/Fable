// src/app/search/users/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function SearchUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    // Navigate to the user profile route
    router.push(`/user/${userId}`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find Users</h1>
        <p className="text-gray-600 mb-8">
          Search for users by name or username to view their profiles and
          articles.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {results.map((user) => (
                    <li
                      key={user.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {(user.full_name || user.username || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-lg">
                            {user.full_name ||
                              user.username ||
                              "Anonymous User"}
                          </p>
                          {user.username && (
                            <p className="text-sm text-gray-500">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.length === 0 && searchTerm && !loading && (
            <div className="text-center py-6 text-gray-500">
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Other Discovery Options
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/feed"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Community Articles
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
