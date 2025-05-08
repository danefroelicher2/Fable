"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function UserSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      // Search for users by username or full name
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(8);

      if (error) {
        console.error("Error searching for users:", error);
        throw error;
      }

      setSearchResults(data || []);
    } catch (err) {
      console.error("Failed to search users:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim().length > 0) {
      router.push(`/search-users?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for users..."
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery.length < 2
                ? "Type at least 2 characters to search"
                : "No users found"}
            </div>
          ) : (
            <ul className="py-2">
              {searchResults.map((user) => (
                <li key={user.id} className="px-4 py-2 hover:bg-gray-100">
                  <Link
                    href={`/user/${user.id}`}
                    className="flex items-center"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden mr-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username || "User"}
                          className="w-full h-full object-cover"
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
                      <div className="font-medium">
                        {user.full_name || user.username || "Anonymous User"}
                      </div>
                      {user.username && (
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              <li className="px-4 py-2 border-t">
                <Link
                  href={`/search-users?q=${encodeURIComponent(searchQuery)}`}
                  className="text-blue-600 hover:text-blue-800 text-center block w-full"
                  onClick={() => setShowResults(false)}
                >
                  View all search results
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}

      {/* Search instructions */}
      <div className="mt-2 text-gray-500 text-sm">
        Search for users by name or username. Press Enter to see full search
        results.
      </div>
    </div>
  );
}
