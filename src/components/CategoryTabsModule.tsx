// src/components/CategoryTabsModule.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./CategoryTabs.module.css";

interface CategoryTabsProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategoryTabsModule({
  activeCategory = "all",
  onCategoryChange,
}: CategoryTabsProps) {
  const pathname = usePathname();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Category data similar to Twitter's interface
  const categories = [
    { id: "all", name: "All" },
    { id: "sports", name: "Sports" },
    { id: "technology", name: "Technology" },
    { id: "art", name: "Art" },
    { id: "entertainment", name: "Entertainment" },
    { id: "gaming", name: "Gaming" },
    { id: "politics", name: "Politics" },
    { id: "food", name: "Food" },
    { id: "science", name: "Science" },
    { id: "education", name: "Education" },
    { id: "history", name: "History" },
  ];

  // Check scroll position on mount and on resize
  useEffect(() => {
    const checkScrollPosition = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10); // 10px buffer
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      // Initial check
      checkScrollPosition();

      // Scroll active category into view on initial render
      setTimeout(() => {
        const activeElement = container.querySelector(`.${styles.tabActive}`);
        if (activeElement) {
          const containerRect = container.getBoundingClientRect();
          const activeRect = activeElement.getBoundingClientRect();

          // Center the active category
          const scrollPosition =
            activeRect.left +
            container.scrollLeft -
            containerRect.left -
            (containerRect.width - activeRect.width) / 2;

          container.scrollTo({ left: scrollPosition, behavior: "smooth" });
          checkScrollPosition();
        }
      }, 100);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [activeCategory]);

  const scrollLeft = () => {
    if (containerRef.current) {
      const newPosition = containerRef.current.scrollLeft - 300;
      containerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const newPosition = containerRef.current.scrollLeft + 300;
      containerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left scroll button - only show when there's content to scroll to */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
          aria-label="Scroll left"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Left fade effect */}
      {showLeftArrow && <div className={styles.scrollFadeLeft}></div>}

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className={`${styles.scrollContainer} ${styles.scrollbarHide}`}
      >
        <div className={styles.tabsRow}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                ${styles.tabButton} 
                ${
                  activeCategory === category.id
                    ? styles.tabActive
                    : styles.tabDefault
                }
                ${styles.categoryTab}
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right fade effect */}
      {showRightArrow && <div className={styles.scrollFadeRight}></div>}

      {/* Right scroll button - only show when there's more content to scroll to */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          aria-label="Scroll right"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
