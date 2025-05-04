"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Add this import
import ProfileNavLink from "./ProfileNavLink"; // Import our new component

export default function ClientSidebarContent() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth(); // Add this to get the current user

  const navItems = [
    { icon: "home", label: "Home", href: "/" },
    { icon: "us", label: "U.S.", href: "/us" },
    { icon: "world", label: "World", href: "/world" },
    { icon: "eras", label: "Eras & Ages", href: "/eras-ages" },
    {
      icon: "science",
      label: "Science & Innovation",
      href: "/science-innovation",
    },
    { icon: "culture", label: "Culture", href: "/culture" },
    { icon: "honor", label: "HISTORY Honors 250", href: "/history-honors-250" },
    { icon: "feed", label: "Community Feed", href: "/feed" },
    // Add profile link using the custom component
    {
      icon: "profile",
      label: "Profile",
      href: user ? `/user/${user.id}` : "/signin?redirect=/profile",
      isProfileLink: true, // Flag to use our custom component
    },
  ];

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    // For profile links, check if the pathname includes '/user/'
    if (href.includes("/user/") && pathname?.includes("/user/")) {
      return true;
    }
    return pathname?.startsWith(href);
  };

  // Render the appropriate icon based on the key
  const renderIcon = (icon: string) => {
    if (icon === "profile") {
      // Special profile icon
      return (
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
      );
    }

    // Default icon for other nav items
    return (
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
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <div className="flex flex-col h-full py-5 px-4 border-r border-gray-200 bg-white overflow-y-auto">
          <Link href="/" className="mb-8 text-center">
            <div className="bg-red-600 px-5 py-2 hover:bg-red-700 transition-colors mx-auto inline-block">
              <span className="text-2xl font-bold tracking-wide text-white">
                LOSTLIBRARY
              </span>
            </div>
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) =>
              item.isProfileLink ? (
                <ProfileNavLink
                  key={item.label}
                  className={`flex items-center px-3 py-3 text-lg font-medium rounded-full hover:bg-gray-100 transition-colors ${
                    isActive(item.href)
                      ? "text-black font-bold"
                      : "text-gray-700"
                  }`}
                  icon={renderIcon(item.icon)}
                >
                  {item.label}
                </ProfileNavLink>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-lg font-medium rounded-full hover:bg-gray-100 transition-colors ${
                    isActive(item.href)
                      ? "text-black font-bold"
                      : "text-gray-700"
                  }`}
                >
                  <span className="mr-4">{renderIcon(item.icon)}</span>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <Link
            href="/write"
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-full font-bold text-center transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Write
          </Link>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 ${
                isActive(item.href) ? "text-red-600" : "text-gray-700"
              }`}
            >
              <span className="h-6 w-6">{renderIcon(item.icon)}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
          {/* Add profile link as last item in mobile nav */}
          <ProfileNavLink
            className={`flex flex-col items-center py-3 px-2 ${
              pathname?.includes("/user/") ? "text-red-600" : "text-gray-700"
            }`}
          >
            <span className="h-6 w-6">{renderIcon("profile")}</span>
            <span className="text-xs mt-1">Profile</span>
          </ProfileNavLink>
        </nav>
      </div>
    </>
  );
}
