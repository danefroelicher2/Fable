// src/components/Navigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header>
      {/* Single unified header with navy background - extra large */}
      <div className="bg-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Social media icons and premium on the left */}
            <div className="flex items-center space-x-4">
              <Link
                href="https://x.com/historiafiles"
                className="hover:text-gray-300"
              >
                <span className="sr-only">X (Twitter)</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="/premium"
                className="hover:text-gray-300 flex items-center"
              >
                <svg
                  className="h-5 w-5 mr-1 text-yellow-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="font-medium">PREMIUM</span>
              </Link>
            </div>

            {/* Logo in center - doubled size */}
            <Link
              href="/"
              className="text-white absolute left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-red-600 px-12 py-6">
                <span className="text-5xl font-bold tracking-wide">
                  LOSTLIBRARY
                </span>
              </div>
            </Link>

            {/* Auth and Search on the right */}
            <div className="flex items-center space-x-4">
              <Link
                href="/write"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Write
              </Link>
              <ProfileDropdown />

              <button
                type="button"
                className="hover:text-gray-300"
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
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block`}>
            <ul className="md:flex md:justify-center md:space-x-8 space-y-2 md:space-y-0">
              <li>
                <Link
                  href="/today-in-history"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  TODAY IN HISTORY
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/wars-events"
                  className="block text-gray-800 hover:text-gray-600 font-medium flex items-center"
                >
                  WARS & EVENTS
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/famous-people"
                  className="block text-gray-800 hover:text-gray-600 font-medium flex items-center"
                >
                  FAMOUS PEOPLE
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/eras"
                  className="block text-gray-800 hover:text-gray-600 font-medium flex items-center"
                >
                  ERAS
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/topics"
                  className="block text-gray-800 hover:text-gray-600 font-medium flex items-center"
                >
                  TOPICS
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/magazines"
                  className="block text-gray-800 hover:text-gray-600 font-medium flex items-center"
                >
                  MAGAZINES
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="/newsletters"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  NEWSLETTERS
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  PODCASTS
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/today-in-history"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TODAY IN HISTORY
            </Link>
            <Link
              href="/wars-events"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              WARS & EVENTS
            </Link>
            <Link
              href="/famous-people"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAMOUS PEOPLE
            </Link>
            <Link
              href="/eras"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ERAS
            </Link>
            <Link
              href="/topics"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TOPICS
            </Link>
            <Link
              href="/magazines"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MAGAZINES
            </Link>
            <Link
              href="/newsletters"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              NEWSLETTERS
            </Link>
            <Link
              href="/podcasts"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PODCASTS
            </Link>
            <Link
              href="/premium"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg
                className="h-5 w-5 mr-2 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              PREMIUM
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
