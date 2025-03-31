"use client";

// src/components/Navigation.tsx
import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header>
      {/* Combined header with logo and search - only dark background */}
      <div className="bg-gray-800 text-white py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo in the center for mobile, left for desktop */}
          <div className="flex items-center">
            {/* X (Twitter) Icon */}
            <Link
              href="https://x.com/historiafiles"
              className="hover:text-gray-300 mr-6"
            >
              <span className="sr-only">X (Twitter)</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>

            {/* Logo for desktop */}
            <Link
              href="/"
              className="hidden md:block text-white text-3xl font-bold"
            >
              HISTORYNET
            </Link>
          </div>

          {/* Logo for mobile - centered */}
          <div className="md:hidden mx-auto">
            <Link href="/" className="text-white text-3xl font-bold">
              HISTORYNET
            </Link>
          </div>

          {/* Search Icon */}
          <div>
            <button type="button" className="hover:text-gray-300">
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

      {/* Navigation Tabs - Light background */}
      <nav className="bg-gray-100 py-3 border-b border-gray-300">
        <div className="container mx-auto px-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-800 hover:text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className={`${isOpen ? "block" : "hidden"} md:block`}>
            <ul className="md:flex md:space-x-8 space-y-2 md:space-y-0 justify-center">
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
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  WARS & EVENTS
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/famous-people"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  FAMOUS PEOPLE
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/eras"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  ERAS
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/topics"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  TOPICS
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/magazines"
                  className="block text-gray-800 hover:text-gray-600 font-medium"
                >
                  MAGAZINES
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
    </header>
  );
}
