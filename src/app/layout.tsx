import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved outside of the component
export const metadata: Metadata = {
  title: "HistoryNet - History, Wars, People, and More",
  description:
    "Exploring historical events, figures, wars, and eras through in-depth articles and analyses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate client component
function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
  ];

  // Function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  // Render the appropriate icon based on the key
  const renderIcon = (icon: string) => {
    switch (icon) {
      case "home":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
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
      case "us":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
        );
      case "world":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "eras":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "science":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      case "culture":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "honor":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      case "feed":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
          <div className="flex flex-col h-full py-5 px-4 border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-y-auto">
            {/* LOSTLIBRARY Logo */}
            <Link href="/" className="mb-8 text-center">
              <div className="bg-red-600 px-5 py-2 hover:bg-red-700 transition-colors mx-auto inline-block">
                <span className="text-2xl font-bold tracking-wide text-white">
                  LOSTLIBRARY
                </span>
              </div>
            </Link>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-lg font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isActive(item.href)
                      ? "text-black dark:text-white font-bold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="mr-4">{renderIcon(item.icon)}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Profile Section */}
            <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              <ProfileDropdown />
            </div>

            {/* Write Button */}
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
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
          <nav className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive(item.href)
                    ? "text-red-600 dark:text-red-500"
                    : "text-gray-700dark:text-gray-300"
                }`}
              >
                <span className="h-6 w-6">{renderIcon(item.icon)}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex flex-col items-center py-3 px-2 text-gray-700 dark:text-gray-300"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-xs mt-1">Search</span>
            </button>
          </nav>
        </div>
      </>

      {/* Main content area with proper padding for sidebar */}
      <main className="md:pl-64 flex-1 pt-2 pb-20 md:pb-12">{children}</main>

      {/* Footer component */}
      <footer className="md:pl-64 bg-gray-800 dark:bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-gray-300">
                HistoryNet is your destination for exploring historical events,
                wars, famous people, and more through in-depth articles and
                analysis.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/wars-events"
                    className="text-gray-300 hover:text-white"
                  >
                    Wars & Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/famous-people"
                    className="text-gray-300 hover:text-white"
                  >
                    Famous People
                  </Link>
                </li>
                <li>
                  <Link href="/eras" className="text-gray-300 hover:text-white">
                    Historical Eras
                  </Link>
                </li>
                <li>
                  <Link
                    href="/topics"
                    className="text-gray-300 hover:text-white"
                  >
                    Special Topics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/newsletters"
                    className="text-gray-300 hover:text-white"
                  >
                    Newsletters
                  </Link>
                </li>
                <li>
                  <Link
                    href="/podcasts"
                    className="text-gray-300 hover:text-white"
                  >
                    Podcasts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Subscribe</h3>
              <form className="mt-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 w-full text-gray-800 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="submit"
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 w-full rounded-md transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} HistoryNet. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
