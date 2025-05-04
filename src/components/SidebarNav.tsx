// src/components/SidebarNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Get the URL for the user's public profile
  const publicProfileUrl = user ? `/user/${user.id}` : "/signin";

  const navItems = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Search",
      href: "/",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      label: "My Profile",
      href: publicProfileUrl,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      label: "Communities",
      href: "/communities",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
      label: "Bookmarks",
      href: "/bookmarks",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      label: "Premium",
      href: "/premium",
    },
  ];

  // Account section items
  const accountItems = [
    {
      label: "Account",
      href: "#", // Typically a header, not clickable
      isHeader: true,
    },
    {
      label: "Manage Profile",
      href: "/profile", // This remains as the edit profile page
    },
    {
      label: "Saved Drafts",
      href: "/profile/drafts",
    },
    {
      label: "Account Settings",
      href: "/profile/account-settings",
    },
    {
      label: "Sign Out",
      href: "/signout",
      isAction: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    // Your sign out logic here
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col w-64 fixed">
      {/* Logo */}
      <div className="p-4">
        <Link
          href="/"
          className="block text-red-600 bg-black p-2 text-2xl font-bold text-center"
        >
          LOSTLIBRARY
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 flex-1">
        <ul className="space-y-2 px-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-gray-800"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Account Section */}
      <div className="mt-auto border-t border-gray-800">
        <ul className="px-4 py-2">
          {accountItems.map((item, index) => (
            <li key={index}>
              {item.isHeader ? (
                <div className="text-gray-500 py-2 px-3">{item.label}</div>
              ) : item.isAction ? (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-red-400 hover:text-red-300 py-2 px-3"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="block text-gray-300 hover:text-white py-2 px-3"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
