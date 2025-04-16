// src/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import SearchBar from "./SearchBar";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

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

  const handleMouseEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  // Navigation category data
  const navCategories = [
    {
      id: "us",
      title: "U.S.",
      href: "/us",
      description:
        "All the major chapters in the American story, from Indigenous beginnings to the present day.",
      links: [
        { label: "Colonial America", href: "/us/colonial-america" },
        { label: "American Revolution", href: "/us/revolution" },
        { label: "Early U.S.", href: "/us/early-us" },
        { label: "Slavery", href: "/us/slavery" },
        { label: "Civil War", href: "/us/civil-war" },
        { label: "Great Depression", href: "/us/great-depression" },
        { label: "Black History", href: "/us/black-history" },
        { label: "LGBTQ+ History", href: "/us/lgbtq-history" },
        { label: "Women's History", href: "/us/womens-history" },
        { label: "Hispanic History", href: "/us/hispanic-history" },
        {
          label: "Native American History",
          href: "/us/native-american-history",
        },
        {
          label: "Asian American & Pacific Islander History",
          href: "/us/asian-american-history",
        },
        { label: "U.S. Presidents", href: "/us/presidents" },
        {
          label: "U.S. Government and Politics",
          href: "/us/government-politics",
        },
        { label: "U.S. Constitution", href: "/us/constitution" },
        { label: "U.S. States", href: "/us/states" },
        { label: "Immigration", href: "/us/immigration" },
        { label: "Crime", href: "/us/crime" },
      ],
    },
    {
      id: "world",
      title: "World",
      href: "/world",
      description:
        "History from countries and communities across the globe, including the world's major wars.",
      links: [
        { label: "Ancient Civilizations", href: "/world/ancient" },
        { label: "European History", href: "/world/europe" },
        { label: "Asian History", href: "/world/asia" },
        { label: "African History", href: "/world/africa" },
        { label: "Latin American History", href: "/world/latin-america" },
        { label: "Middle Eastern History", href: "/world/middle-east" },
        { label: "World War I", href: "/world/ww1" },
        { label: "World War II", href: "/world/ww2" },
        { label: "Cold War", href: "/world/cold-war" },
        { label: "Holocaust", href: "/world/holocaust" },
        { label: "Exploration", href: "/world/exploration" },
        {
          label: "Industrial Revolution",
          href: "/world/industrial-revolution",
        },
      ],
    },
    {
      id: "eras",
      title: "Eras & Ages",
      href: "/eras",
      description:
        "Explore history organized by distinct time periods and major historical transformations.",
      links: [
        {
          label: "Early Civilizations",
          href: "/eras/early-civilizations",
        },
        {
          label: "Rise of Empires",
          href: "/eras/rise-of-empires",
        },
        {
          label: "Classical Empires",
          href: "/eras/classical-empires",
        },
        {
          label: "Rise of Religion",
          href: "/eras/rise-of-religion",
        },
        { label: "Renaissance", href: "/eras/renaissance" },
        {
          label: "Era of Revolutions",
          href: "/eras/era-of-revolutions",
        },
        { label: "Common Era", href: "/eras/common-era" },
        { label: "Industrial Revolution", href: "/eras/industrial-revolution" },
        { label: "Information Age", href: "/eras/information-age" },
      ],
    },
    {
      id: "wars",
      title: "Wars",
      href: "/wars",
      description:
        "Military conflicts that shaped nations and changed the course of history.",
      links: [
        { label: "World War I", href: "/wars/world-war-i" },
        { label: "World War II", href: "/wars/world-war-ii" },
        { label: "Cold War", href: "/wars/cold-war" },
        { label: "American Civil War", href: "/wars/american-civil-war" },
        { label: "Napoleonic Wars", href: "/wars/napoleonic-wars" },
        { label: "Vietnam War", href: "/wars/vietnam-war" },
        { label: "Korean War", href: "/wars/korean-war" },
        { label: "Ancient Warfare", href: "/wars/ancient-warfare" },
        { label: "All Wars & Conflicts", href: "/wars/all" },
      ],
    },
    {
      id: "science",
      title: "Science & Innovation",
      href: "/science-innovation",
      description:
        "The evolution of human knowledge and technological breakthroughs throughout history.",
      links: [
        {
          label: "Scientific Discoveries",
          href: "/science-innovation/discoveries",
        },
        { label: "Inventions", href: "/science-innovation/inventions" },
        { label: "Technology", href: "/science-innovation/technology" },
        { label: "Medicine", href: "/science-innovation/medicine" },
        { label: "Space Exploration", href: "/science-innovation/space" },
        {
          label: "Industrial Revolution",
          href: "/science-innovation/industrial-revolution",
        },
        { label: "Famous Scientists", href: "/science-innovation/scientists" },
        {
          label: "Digital Revolution",
          href: "/science-innovation/digital-revolution",
        },
        {
          label: "Engineering Marvels",
          href: "/science-innovation/engineering",
        },
      ],
    },
  ];

  // Function to create a grid layout from a flat list of links
  const createGrid = (
    links: { label: string; href: string }[],
    columns: number = 3
  ) => {
    const columnSize = Math.ceil(links.length / columns);
    const grid = [];

    for (let i = 0; i < columns; i++) {
      const startIdx = i * columnSize;
      const columnLinks = links.slice(startIdx, startIdx + columnSize);
      grid.push(columnLinks);
    }

    return grid;
  };

  return (
    <header
      className={`${
        isScrolled ? "shadow-md" : ""
      } transition-shadow duration-300`}
    >
      {/* Single unified header with navy background - extra large */}
      <div
        className={`bg-gray-900 text-white ${
          isScrolled ? "py-10" : "py-20"
        } transition-all duration-300`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Social media icons on the left */}
            <div className="flex items-center md:ml-60 ml-0">
              <Link
                href="https://x.com/lostxlibrary"
                className="hover:text-gray-300 transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <span className="sr-only">X (Twitter)</span>
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link href="/feed" className="nav-link flex items-center ml-4">
                Community Articles
              </Link>
              {/* Add more social icons if needed */}
              <a
                href="https://facebook.com/lostlibrary"
                className="ml-4 hover:text-gray-300 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
            </div>

            {/* Logo in center */}
            <Link
              href="/"
              className="text-white absolute left-1/2 transform -translate-x-1/2 transition-all duration-300"
            >
              <div className="bg-red-600 px-12 py-6 hover:bg-red-700 transition-colors">
                <span className="text-6xl font-bold tracking-wide">
                  LOSTLIBRARY
                </span>
              </div>
            </Link>

            {/* Auth and Search on the right */}
            <div className="flex items-center space-x-4">
              {/* Search button for mobile view */}
              <button
                className="md:hidden text-white hover:text-gray-300"
                onClick={() => setShowSearchMobile(!showSearchMobile)}
                aria-label="Toggle search"
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
              </button>

              {/* Desktop search bar */}
              <div className="hidden md:block w-65">
                <SearchBar />
              </div>

              <Link
                href="/write"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Write
              </Link>
              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile search bar (toggle with button) */}
          {showSearchMobile && (
            <div className="mt-4 md:hidden px-4">
              <SearchBar />
            </div>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white border-b border-gray-200 py-3 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-600 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
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
            <ul className="main-nav md:flex md:justify-center md:space-x-8 space-y-2 md:space-y-0">
              {navCategories.map((category) => (
                <li
                  key={category.id}
                  className="nav-item relative"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href={category.href}
                    className="nav-link flex items-center"
                  >
                    {category.title}
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
                  </a>

                  {activeDropdown === category.id && (
                    <div className="absolute left-0 w-full bg-white shadow-lg z-50 border-t border-gray-200">
                      <div
                        className="container mx-auto py-6"
                        style={{ maxWidth: "1200px" }}
                      >
                        <div className="flex">
                          {/* Left side with title and description */}
                          <div className="w-1/4 pr-8">
                            <h2 className="text-xl font-bold text-gray-800">
                              {category.title}
                              {category.id !== "science" ? " History" : ""}
                            </h2>
                            {category.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {category.description}
                              </p>
                            )}
                          </div>

                          {/* Right side with links in a grid */}
                          <div className="w-3/4">
                            <div className="grid grid-cols-3 gap-x-8 gap-y-0">
                              {createGrid(category.links).map(
                                (column, colIndex) => (
                                  <div key={colIndex} className="space-y-1">
                                    {column.map((item, itemIndex) => (
                                      <a
                                        key={itemIndex}
                                        href={item.href}
                                        className="block py-1 text-gray-700 hover:text-red-600 transition-colors text-sm"
                                      >
                                        {item.label}
                                      </a>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {/* Add the Community link here */}
              <li className="nav-item relative">
                <Link href="/feed" className="nav-link flex items-center">
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navCategories.map((category) => (
              <div key={category.id} className="border-l-4 border-red-600 pl-2">
                <Link
                  href={category.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.title.toUpperCase()}
                </Link>

                {category.links.slice(0, 6).map((item, itemIndex) => (
                  <Link
                    key={`${category.id}-${itemIndex}`}
                    href={item.href}
                    className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    • {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
