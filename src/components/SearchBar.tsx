// src/components/SearchBar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle outside click to collapse the search bar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center">
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }
          }}
          className="text-white hover:text-gray-300 transition-colors"
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

        <div
          className={`absolute right-0 top-0 overflow-hidden transition-all duration-300 ${
            isExpanded ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="bg-gray-800 text-white py-1 px-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </div>
  );
}
