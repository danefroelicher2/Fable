// src/components/ProfileDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!user) {
    return (
      <Link href="/signin" className="text-white hover:text-gray-300">
        Sign In
      </Link>
    );
  }

  return (
    <div
      className="relative profile-dropdown-container"
      ref={dropdownRef}
      style={{ zIndex: 101 }}
    >
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-white focus:outline-none"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-800 font-medium">
          {user.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
          style={{ zIndex: 100 }}
        >
          <div className="px-4 py-2 border-b text-sm font-medium text-gray-700 truncate">
            {user.email}
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/profile/account-settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            Account Settings
          </Link>

          <Link
            href="/profile/drafts"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            Saved Drafts
          </Link>

          <Link
            href="/premium"
            className="block px-4 py-2 text-sm text-yellow-600 font-medium hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            Unlock Premium
          </Link>

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
