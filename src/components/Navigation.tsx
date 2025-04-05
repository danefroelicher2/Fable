// src/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import NavDropdown from "./NavDropdown";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Define dropdown items for Eras
  const erasDropdownItems = [
    {
      label: "Early Civilizations (3000 BCE - 1200 BCE)",
      href: "/eras/early-civilizations",
    },
    {
      label: "Rise of Empires (1200 BCE - 500 BCE)",
      href: "/eras/rise-of-empires",
    },
    {
      label: "Classical Empires (500 BCE - 500 CE)",
      href: "/eras/classical-empires",
    },
    {
      label: "Rise of Religion (300 CE - 800 CE)",
      href: "/eras/rise-of-religion",
    },
    {
      label: "Renaissance (1400 - 1700 CE)",
      href: "/eras/renaissance",
    },
    {
      label: "Era of Revolutions (1700 - 1900 CE)",
      href: "/eras/era-of-revolutions",
    },
    {
      label: "Common Era (1900 - Present)",
      href: "/eras/common-era",
    },
  ];

  // Define dropdown items for Wars & Events
  const warsEventsDropdownItems = [
    {
      label: "World War I",
      href: "/wars-events/world-war-i",
    },
    {
      label: "World War II",
      href: "/wars-events/world-war-ii",
    },
    {
      label: "Cold War",
      href: "/wars-events/cold-war",
    },
    {
      label: "American Civil War",
      href: "/wars-events/american-civil-war",
    },
    {
      label: "Napoleonic Wars",
      href: "/wars-events/napoleonic-wars",
    },
    {
      label: "All Wars & Conflicts",
      href: "/wars-events/all",
    },
  ];

  // Define dropdown items for Famous People
  const famousPeopleDropdownItems = [
    {
      label: "Political Leaders",
      href: "/famous-people/political-leaders",
    },
    {
      label: "Military Figures",
      href: "/famous-people/military-figures",
    },
    {
      label: "Philosophers & Thinkers",
      href: "/famous-people/philosophers",
    },
    {
      label: "Scientists & Inventors",
      href: "/famous-people/scientists",
    },
    {
      label: "Artists & Writers",
      href: "/famous-people/artists",
    },
    {
      label: "Explorers & Adventurers",
      href: "/famous-people/explorers",
    },
  ];

  // Define dropdown items for Topics
  const topicsDropdownItems = [
    {
      label: "Military History",
      href: "/topics/military-history",
    },
    {
      label: "Cultural History",
      href: "/topics/cultural-history",
    },
    {
      label: "Science & Technology",
      href: "/topics/science-technology",
    },
    {
      label: "Art & Architecture",
      href: "/topics/art-architecture",
    },
    {
      label: "Religion & Philosophy",
      href: "/topics/religion-philosophy",
    },
    {
      label: "Politics & Government",
      href: "/topics/politics-government",
    },
    {
      label: "Economics & Trade",
      href: "/topics/economics-trade",
    },
  ];

  // Define dropdown items for Magazines
  const magazinesDropdownItems = [
    {
      label: "Historical Quarterly",
      href: "/magazines/historical-quarterly",
    },
    {
      label: "Ancient Times",
      href: "/magazines/ancient-times",
    },
    {
      label: "Modern History Review",
      href: "/magazines/modern-history-review",
    },
    {
      label: "War Chronicles",
      href: "/magazines/war-chronicles",
    },
    {
      label: "Cultural Heritage",
      href: "/magazines/cultural-heritage",
    },
    {
      label: "All Publications",
      href: "/magazines/all",
    },
  ];

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
            <div className="flex items-center ml-60">
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
              <Link
                href="/write"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Write
              </Link>
              <ProfileDropdown />

              <button
                type="button"
                className="hover:text-gray-300 transition-colors"
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
      <nav className="bg-gray-100 py-3 sticky top-0 z-50">
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
            <ul className="md:flex md:justify-center md:space-x-8 space-y-2 md:space-y-0">
              <li>
                <Link
                  href="/today-in-history"
                  className="block text-gray-800 hover:text-red-600 font-medium transition-colors"
                >
                  TODAY IN HISTORY
                </Link>
              </li>
              <li className="relative group">
                <Link
                  href="/wars-events"
                  className="block text-gray-800 hover:text-red-600 font-medium flex items-center transition-colors"
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
                <NavDropdown items={warsEventsDropdownItems} />
              </li>
              <li className="relative group">
                <Link
                  href="/famous-people"
                  className="block text-gray-800 hover:text-red-600 font-medium flex items-center transition-colors"
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
                <NavDropdown items={famousPeopleDropdownItems} />
              </li>
              <li className="relative group">
                <Link
                  href="/eras"
                  className="block text-gray-800 hover:text-red-600 font-medium flex items-center transition-colors"
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
                <NavDropdown items={erasDropdownItems} />
              </li>

              <li className="relative group">
                <Link
                  href="/topics"
                  className="block text-gray-800 hover:text-red-600 font-medium flex items-center transition-colors"
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
                <NavDropdown items={topicsDropdownItems} />
              </li>
              <li className="relative group">
                <Link
                  href="/magazines"
                  className="block text-gray-800 hover:text-red-600 font-medium flex items-center transition-colors"
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
                <NavDropdown items={magazinesDropdownItems} />
              </li>
              <li>
                <Link
                  href="/newsletters"
                  className="block text-gray-800 hover:text-red-600 font-medium transition-colors"
                >
                  NEWSLETTERS
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="block text-gray-800 hover:text-red-600 font-medium transition-colors"
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
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/today-in-history"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TODAY IN HISTORY
            </Link>

            {/* Mobile dropdown for Wars & Events */}
            <div className="border-l-4 border-red-600 pl-2">
              <Link
                href="/wars-events"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                WARS & EVENTS
              </Link>
              {warsEventsDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile dropdown for Famous People */}
            <div className="border-l-4 border-red-600 pl-2">
              <Link
                href="/famous-people"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAMOUS PEOPLE
              </Link>
              {famousPeopleDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile dropdown for Eras */}
            <div className="border-l-4 border-red-600 pl-2">
              <Link
                href="/eras"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ERAS
              </Link>
              {erasDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile dropdown for Topics */}
            <div className="border-l-4 border-red-600 pl-2">
              <Link
                href="/topics"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                TOPICS
              </Link>
              {topicsDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile dropdown for Magazines */}
            <div className="border-l-4 border-red-600 pl-2">
              <Link
                href="/magazines"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                MAGAZINES
              </Link>
              {magazinesDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}
            </div>

            <Link
              href="/newsletters"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              NEWSLETTERS
            </Link>
            <Link
              href="/podcasts"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PODCASTS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
