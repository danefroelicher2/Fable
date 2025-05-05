// src/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Get the URL for the user's public profile
  const publicProfileUrl = user ? `/user/${user.id}` : "/signin";

  // Function to handle post creation
  const handlePostClick = () => {
    router.push("/write");
  };

  return (
    <nav className="bg-gray-900 text-white h-screen w-64 fixed flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/" className="block">
          <div className="bg-red-600 p-4 text-center">
            <span className="text-2xl font-bold">LOSTLIBRARY</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="mt-8 flex-grow">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center px-4 py-3 hover:bg-gray-800"
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

          <Link
            href="/notifications"
            className={`flex items-center px-4 py-3 ${
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
          </Link>

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
        </div>
      </div>

      {/* Flexible spacer to push Post button up from the bottom */}
      <div className="flex-grow"></div>

      {/* Post Button */}
      <div className="px-4 py-4">
        <button
          onClick={handlePostClick}
          className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-full w-full transition-colors"
        >
          Post
        </button>
      </div>

      {/* Profile Dropdown at the bottom */}
      <div className="px-4 pb-4">{user && <ProfileDropdown />}</div>
    </nav>
  );
}
