// src/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBadge from "./NotificationBadge";
import MessageBadge from "./MessageBadge";
import { supabase } from "@/lib/supabase";

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(true);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Get the URL for the user's public profile
  const publicProfileUrl = user ? `/user/${user.id}` : "/signin";

  // Function to handle post creation
  const handlePostClick = () => {
    router.push("/write");
  };

  // Detect zoom level using window width to determine if we should show the More button
  useEffect(() => {
    const checkZoomLevel = () => {
      // This is a rough approximation - we're assuming standard screen sizes
      // If the viewport height is greater than a certain threshold,
      // we assume the zoom level is lower and can fit all items
      // This threshold can be adjusted as needed
      if (window.innerHeight > 700) {
        setShowMoreButton(false);
      } else {
        setShowMoreButton(true);
      }
    };

    // Check on component mount
    checkZoomLevel();

    // Check on window resize (which happens when zooming)
    window.addEventListener("resize", checkZoomLevel);

    return () => {
      window.removeEventListener("resize", checkZoomLevel);
    };
  }, []);

  // Close the More menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch profile data to get username
  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
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

  // Get the display username
  const displayUsername =
    user && profileData?.username
      ? `@${profileData.username}`
      : user?.email
      ? `@${user.email.split("@")[0]}`
      : "@user";

  // Toggle More menu
  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white w-64 fixed left-0 top-0 bottom-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/" className="block">
          <div className="bg-red-600 p-4 text-center">
            <span className="text-2xl font-bold">LOSTLIBRARY</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation - using flex-grow to allow scrolling for overflow */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-1 py-2">
          {/* Home Button - Added at the top of navigation */}
          <Link
            href="/"
            className={`flex items-center px-4 py-3 ${
              pathname === "/" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            href="/search"
            className={`flex items-center px-4 py-3 ${
              pathname === "/search" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Search</span>
          </Link>

          <Link
            href={publicProfileUrl}
            className={`flex items-center px-4 py-3 ${
              pathname === publicProfileUrl
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>My Profile</span>
          </Link>

          {/* Notifications link */}
          {user ? (
            <Link
              href="/notifications"
              className={`flex items-center px-4 py-3 relative ${
                pathname === "/notifications"
                  ? "bg-gray-800"
                  : "hover:bg-gray-800"
              }`}
            >
              <svg
                className="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Notifications</span>

              <div className="absolute top-2 left-5">
                <NotificationBadge className="h-5 w-5 flex items-center justify-center" />
              </div>
            </Link>
          ) : (
            <button
              onClick={() =>
                router.push(
                  `/signin?redirect=${encodeURIComponent("/notifications")}`
                )
              }
              className="flex items-center px-4 py-3 hover:bg-gray-800 w-full text-left"
            >
              <svg
                className="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Notifications</span>
            </button>
          )}

          {/* Messages link */}
          {user ? (
            <Link
              href="/messages"
              className={`flex items-center px-4 py-3 relative ${
                pathname === "/messages" ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              <svg
                className="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Messages</span>

              <div className="absolute top-2 left-5">
                <MessageBadge className="h-5 w-5 flex items-center justify-center" />
              </div>
            </Link>
          ) : (
            <button
              onClick={() =>
                router.push(
                  `/signin?redirect=${encodeURIComponent("/messages")}`
                )
              }
              className="flex items-center px-4 py-3 hover:bg-gray-800 w-full text-left"
            >
              <svg
                className="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Messages</span>
            </button>
          )}

          <Link
            href="/communities"
            className={`flex items-center px-4 py-3 ${
              pathname === "/communities" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Communities</span>
          </Link>

          <Link
            href="/bookmarks"
            className={`flex items-center px-4 py-3 ${
              pathname === "/bookmarks" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Bookmarks</span>
          </Link>

          {/* More Button - Moved here right after Bookmarks */}
          {showMoreButton && (
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={toggleMoreMenu}
                className="flex items-center px-4 py-3 hover:bg-gray-800 w-full text-left"
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>More</span>
              </button>

              {/* Dropdown menu - Now positioned above the button */}
              {isMoreMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-md shadow-lg bg-gray-800 z-50">
                  <div className="py-1">
                    <Link
                      href="/premium"
                      className="flex items-center px-4 py-3 hover:bg-gray-700 text-white"
                    >
                      <svg
                        className="w-6 h-6 mr-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Premium</span>
                    </Link>

                    {user ? (
                      <Link
                        href="/profile/drafts"
                        className="flex items-center px-4 py-3 hover:bg-gray-700 text-white"
                      >
                        <svg
                          className="w-6 h-6 mr-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Saved Drafts</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(
                            `/signin?redirect=${encodeURIComponent(
                              "/profile/drafts"
                            )}`
                          )
                        }
                        className="flex items-center px-4 py-3 hover:bg-gray-700 text-white w-full text-left"
                      >
                        <svg
                          className="w-6 h-6 mr-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Saved Drafts</span>
                      </button>
                    )}

                    <Link
                      href="/profile/account-settings"
                      className="flex items-center px-4 py-3 hover:bg-gray-700 text-white"
                    >
                      <svg
                        className="w-6 h-6 mr-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Account Settings</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items that will only show when More button is hidden */}
          {!showMoreButton && (
            <>
              <Link
                href="/premium"
                className={`flex items-center px-4 py-3 ${
                  pathname === "/premium" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Premium</span>
              </Link>

              {/* Saved Drafts link */}
              {user ? (
                <Link
                  href="/profile/drafts"
                  className={`flex items-center px-4 py-3 ${
                    pathname === "/profile/drafts"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Saved Drafts</span>
                </Link>
              ) : (
                <button
                  onClick={() =>
                    router.push(
                      `/signin?redirect=${encodeURIComponent(
                        "/profile/drafts"
                      )}`
                    )
                  }
                  className="flex items-center px-4 py-3 hover:bg-gray-800 w-full text-left"
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Saved Drafts</span>
                </button>
              )}

              <Link
                href="/profile/account-settings"
                className={`flex items-center px-4 py-3 ${
                  pathname === "/profile/account-settings"
                    ? "bg-gray-800"
                    : "hover:bg-gray-800"
                }`}
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Account Settings</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Post Button and Profile Dropdown in a sticky footer */}
      <div className="mt-auto p-4 space-y-3">
        {/* Post button */}
        <button
          onClick={handlePostClick}
          className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-full w-full transition-colors"
        >
          Post
        </button>

        {user && <ProfileDropdown />}
      </div>
    </nav>
  );
}
