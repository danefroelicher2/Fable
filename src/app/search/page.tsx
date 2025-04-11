// src/app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface UserSearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  async function performSearch() {
    setLoading(true);
    setError(null);

    try {
      // Search for users whose username or full_name contains the query
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
        .order("username", { ascending: true });

      if (error) throw error;

      setResults(data || []);
    } catch (err) {
      console.error("Error searching for users:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {query ? `Search Results for "${query}"` : "Search"}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md flex items-center"
              >
                <div className="w-14 h-14 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-grow">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden mr-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">
                        {(user.username ||
                          user.full_name ||
                          "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {user.full_name || user.username || "Anonymous User"}
                    </h2>
                    {user.username && (
                      <p className="text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-600 mb-4">
              No users found matching "{query}"
            </p>
            <p className="text-gray-500">
              Try a different search term or browse articles instead
            </p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-600">
              Enter a search term to find users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
