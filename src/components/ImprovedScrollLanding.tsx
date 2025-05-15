// src/components/ImprovedScrollLanding.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import "./ImprovedScrollLanding.css";

const ImprovedScrollLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle scroll events to add animation effects
  useEffect(() => {
    // Mark component as client-side rendered
    setIsClient(true);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set loaded state after component mounts for entrance animations
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Generate particle positions for better distribution
  const flamePositions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      left: i * 8.33, // Distribute across the screen (12 flames = ~8.33% spacing)
      delay: Math.random() * 2,
      scale: 0.8 + Math.random() * 0.8, // Random scale between 0.8 and 1.6
      height: 130 + Math.random() * 80, // Random height between 130px and 210px
    }));
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Top section with LostLibrary title */}
      <div className="relative top-title-section w-full flex items-center justify-center">
        <h1
          className={`text-white text-8xl md:text-9xl lg:text-11xl font-bold tracking-wide glow-effect-white mega-title ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"
          } transition-all duration-1000`}
        >
          LOSTLIBRARY
        </h1>
      </div>

      {/* Bottom section with scroll and fire */}
      <div className="relative scroll-history-section w-full flex items-end justify-center">
        {/* Realistic fire effect */}
        <div className="absolute inset-x-0 bottom-0 z-0 fire-container">
          {/* Fire with jagged flames */}
          <div className="fire-base">
            {isClient &&
              flamePositions.map((flamePos, i) => (
                <div
                  key={`flame-container-${i}`}
                  className="jagged-flame-container"
                  style={{
                    left: `${flamePos.left}%`,
                    height: `${flamePos.height}px`,
                    animationDelay: `${flamePos.delay}s`,
                    transform: `translateX(-50%) scale(${flamePos.scale})`,
                  }}
                >
                  <div className="jagged-flame jagged-flame-outer"></div>
                  <div className="jagged-flame jagged-flame-inner"></div>
                  <div className="jagged-flame jagged-flame-core"></div>
                </div>
              ))}
          </div>

          {/* Floating sparks and embers */}
          {isClient &&
            Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`spark-${i}`}
                className="spark"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${0.5 + Math.random() * 2}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  width: Math.random() > 0.8 ? "3px" : "1px", // Occasionally larger sparks
                  height: Math.random() > 0.8 ? "4px" : "2px",
                }}
              ></div>
            ))}

          {/* Red/orange glow at bottom */}
          <div className="fire-glow"></div>
        </div>

        {/* Realistic scroll container at the bottom */}
        <div
          className={`relative z-10 w-full max-w-3xl mx-auto transform transition-all duration-1000 px-4 bottom-scroll ${
            scrolled
              ? "translate-y-[-20px] scale-95 opacity-90"
              : "translate-y-0 scale-100 opacity-100"
          } ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
        >
          <div className="realistic-scroll-container">
            {/* Scroll with handles */}
            <div className="realistic-scroll">
              {/* Left scroll handle */}
              <div className="scroll-handle scroll-handle-left"></div>

              {/* Main parchment area with ThisDayInHistory */}
              <div className="scroll-content">
                {/* ThisDayInHistory component inside the scroll */}
                <div className="history-in-scroll">
                  <ThisDayInHistory />
                </div>
              </div>

              {/* Right scroll handle */}
              <div className="scroll-handle scroll-handle-right"></div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center text-white">
            <p className="mb-2 text-sm">Scroll to explore</p>
            <svg
              className="animate-bounce w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedScrollLanding;
