"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface UserSearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigateToProfile = (userId: string) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    router.push(`/user/${userId}`);
  };

  return (
    <div className="relative z-[9999]" ref={searchRef}>
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onClick={() => {
              if (searchQuery && searchResults.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            placeholder="Search users..."
            className="border rounded-md py-1 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800"
          />
          <button
            type="button"
            onClick={() => {
              if (searchQuery) {
                searchUsers(searchQuery);
                setIsDropdownOpen(true);
              }
            }}
            className="ml-2 bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          </button>
        </div>

        {isDropdownOpen && searchQuery && (
          <div
            className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 z-[10000]"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span>Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => (
                  <li key={user.id} className="border-b last:border-0">
                    <Link
                      href={`/user/${user.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToProfile(user.id);
                      }}
                      className="block p-3 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 overflow-hidden mr-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {user.username?.charAt(0).toUpperCase() ||
                              user.full_name?.charAt(0).toUpperCase() ||
                              "U"}
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
              </ul>
            ) : searchQuery.length > 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found matching "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
