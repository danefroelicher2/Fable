// src/components/ProfileDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ProfileDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data for the avatar
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, username, full_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, [user]);

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
    return null;
  }

  // Safely get the email address, handling potential undefined
  const userEmail = user?.email || "";

  // Safely truncate email if needed
  const displayEmail =
    userEmail.length > 16 ? `${userEmail.substring(0, 16)}...` : userEmail;

  // Safely get the first character of the email
  const avatarInitial =
    userEmail.length > 0 ? userEmail.charAt(0).toUpperCase() : "U";

  // Get display name - prefer full name, then username
  const displayName =
    profileData?.full_name || profileData?.username || "Account";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown menu - Positioned ABOVE the button when open */}
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-black rounded-xl shadow-lg py-2 z-50 border border-gray-800">
          {/* Option to add an existing account (like X has) */}
          <button
            onClick={() => {
              // Handle add account logic
              setIsDropdownOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Add an existing account
          </button>

          {/* Sign out option */}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Log out @{profileData?.username || userEmail.split("@")[0]}
          </button>
        </div>
      )}

      {/* Profile button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center w-full text-sm font-medium text-white hover:bg-gray-800 rounded-full transition-colors p-2"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-gray-300 font-medium mr-3">
            {profileData?.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <div className="flex-1 text-left mr-2">
            <div className="font-medium text-white">{displayName}</div>
            <div className="text-xs text-gray-400 truncate">{displayEmail}</div>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
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
        </div>
      </button>
    </div>
  );
}
