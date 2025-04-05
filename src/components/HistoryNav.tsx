// src/components/HistoryNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

interface NavItem {
  name: string;
  href: string;
  children?: NavItem[];
}

export default function HistoryNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // Handle scroll events to apply styling changes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const navigation: NavItem[] = [
    {
      name: "U.S.",
      href: "/us",
      children: [
        { name: "Colonial America", href: "/us/colonial-america" },
        { name: "American Revolution", href: "/us/american-revolution" },
        { name: "Early U.S.", href: "/us/early-us" },
        { name: "Slavery", href: "/us/slavery" },
        { name: "Civil War", href: "/us/civil-war" },
        { name: "Immigration", href: "/us/immigration" },
        { name: "Great Depression", href: "/us/great-depression" },
        { name: "Black History", href: "/us/black-history" },
        { name: "Hispanic History", href: "/us/hispanic-history" },
        { name: "Women's History", href: "/us/womens-history" },
        { name: "LGBTQ+ History", href: "/us/lgbtq-history" },
        {
          name: "Native American History",
          href: "/us/native-american-history",
        },
        {
          name: "Asian American & Pacific Islander History",
          href: "/us/aapi-history",
        },
        { name: "U.S. Presidents", href: "/us/presidents" },
        { name: "First Ladies", href: "/us/first-ladies" },
        { name: "U.S. Constitution", href: "/us/constitution" },
        {
          name: "U.S. Government and Politics",
          href: "/us/government-politics",
        },
        { name: "U.S. States", href: "/us/states" },
        { name: "Crime", href: "/us/crime" },
      ],
    },
    {
      name: "World",
      href: "/world",
      children: [
        { name: "Ancient Civilizations", href: "/world/ancient-civilizations" },
        { name: "European History", href: "/world/european-history" },
        { name: "Asian History", href: "/world/asian-history" },
        { name: "African History", href: "/world/african-history" },
        {
          name: "Latin American History",
          href: "/world/latin-american-history",
        },
        {
          name: "Middle Eastern History",
          href: "/world/middle-eastern-history",
        },
        { name: "World Wars", href: "/world/world-wars" },
        { name: "Cold War", href: "/world/cold-war" },
      ],
    },
    {
      name: "Eras & Ages",
      href: "/eras-ages",
      children: [
        { name: "Ancient History", href: "/eras/ancient-history" },
        { name: "Medieval Period", href: "/eras/medieval-period" },
        { name: "Renaissance", href: "/eras/renaissance" },
        { name: "Age of Exploration", href: "/eras/age-of-exploration" },
        { name: "Industrial Revolution", href: "/eras/industrial-revolution" },
        { name: "Modern Era", href: "/eras/modern-era" },
      ],
    },
    {
      name: "Culture",
      href: "/culture",
      children: [
        { name: "Art History", href: "/culture/art-history" },
        { name: "Music History", href: "/culture/music-history" },
        { name: "Fashion History", href: "/culture/fashion-history" },
        { name: "Sports History", href: "/culture/sports-history" },
        { name: "Food History", href: "/culture/food-history" },
      ],
    },
    {
      name: "Science & Innovation",
      href: "/science-innovation",
      children: [
        { name: "Scientific Discoveries", href: "/science/discoveries" },
        { name: "Inventions", href: "/science/inventions" },
        { name: "Medical Advances", href: "/science/medical-advances" },
        { name: "Space Exploration", href: "/science/space-exploration" },
        { name: "Technology", href: "/science/technology" },
      ],
    },
    {
      name: "HISTORY Honors 250",
      href: "/history-honors-250",
    },
  ];

  return (
    <header className={`w-full ${isScrolled ? "shadow-md" : ""}`}>
      {/* Top bar with logo and search */}
      <div className="bg-white py-4 border-b">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              This Day in History
            </Link>
          </div>

          <div className="flex-grow flex justify-center">
            <Link href="/" className="flex items-center justify-center">
              <div className="w-16 h-16">
                <img
                  src="/history-channel-logo.svg"
                  alt="HISTORY"
                  className="w-full h-full"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-800 hover:text-gray-600">
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
            </button>

            <button className="text-gray-800 hover:text-gray-600">
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
            </button>

            <Link
              href="/stream"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Stream HISTORY
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          {/* Mobile menu button */}
          <div className="md:hidden py-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center text-gray-800"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Menu
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <ul className="flex justify-center">
              {navigation.map((item) => (
                <li
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="block px-4 py-4 text-gray-800 hover:text-blue-600 font-medium flex items-center"
                  >
                    {item.name}
                    {item.children && (
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
                        />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown menu */}
                  {item.children && activeMenu === item.name && (
                    <div className="absolute left-0 z-10 w-full bg-white shadow-lg pt-4 pb-8 px-8 mt-0">
                      <div className="container mx-auto">
                        {item.name === "U.S." && (
                          <div>
                            <h3 className="text-xl mb-4 font-serif">
                              U.S. History
                            </h3>
                            <p className="text-gray-600 mb-6">
                              All the major chapters in the American story, from
                              Indigenous beginnings to the present day.
                            </p>

                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-3">
                                {item.children.slice(0, 7).map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    className="block text-gray-700 hover:text-blue-600"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                              <div className="space-y-3">
                                {item.children.slice(7, 14).map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    className="block text-gray-700 hover:text-blue-600"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                              <div className="space-y-3">
                                {item.children.slice(14).map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    className="block text-gray-700 hover:text-blue-600"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {item.name !== "U.S." && item.children && (
                          <div className="grid grid-cols-3 gap-6">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block text-gray-700 hover:text-blue-600"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-800"
                  >
                    {item.name}
                  </Link>

                  {item.children && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-3 py-1 text-sm text-gray-600"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* U.S. History Dropdown Example - For visual presentation of expanded state */}
      <div className="hidden">
        <div className="container mx-auto py-12 px-8">
          <div>
            <h3 className="text-2xl mb-4 font-serif">U.S. History</h3>
            <p className="text-gray-600 mb-6">
              All the major chapters in the American story, from Indigenous
              beginnings to the present day.
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Link
                  href="/us/colonial-america"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Colonial America
                </Link>
                <Link
                  href="/us/american-revolution"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  American Revolution
                </Link>
                <Link
                  href="/us/early-us"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Early U.S.
                </Link>
                <Link
                  href="/us/slavery"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Slavery
                </Link>
                <Link
                  href="/us/civil-war"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Civil War
                </Link>
                <Link
                  href="/us/immigration"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Immigration
                </Link>
              </div>
              <div className="space-y-3">
                <Link
                  href="/us/great-depression"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Great Depression
                </Link>
                <Link
                  href="/us/black-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Black History
                </Link>
                <Link
                  href="/us/hispanic-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Hispanic History
                </Link>
                <Link
                  href="/us/womens-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Women's History
                </Link>
                <Link
                  href="/us/lgbtq-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  LGBTQ+ History
                </Link>
                <Link
                  href="/us/native-american-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Native American History
                </Link>
              </div>
              <div className="space-y-3">
                <Link
                  href="/us/asian-american-pacific-islander-history"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Asian American & Pacific Islander History
                </Link>
                <Link
                  href="/us/presidents"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  U.S. Presidents
                </Link>
                <Link
                  href="/us/first-ladies"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  First Ladies
                </Link>
                <Link
                  href="/us/constitution"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  U.S. Constitution
                </Link>
                <Link
                  href="/us/government-politics"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  U.S. Government and Politics
                </Link>
                <Link
                  href="/us/states"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  U.S. States
                </Link>
                <Link
                  href="/us/crime"
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Crime
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
