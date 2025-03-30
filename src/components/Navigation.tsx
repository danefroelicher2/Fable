"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-900">
              History Blog
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md ${
                  isActive(link.href)
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoading ? (
              // Show a loading indicator while checking auth state
              <div className="px-3 py-2 text-gray-500">Loading...</div>
            ) : (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <Link
                      href="/profile"
                      className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md ${
                isActive(link.href)
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
