// src/components/ImprovedScrollLanding.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import "./ImprovedScrollLanding.css";

const ImprovedScrollLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const flameTotalCount = 10; // Number of flame clusters
  const sparkTotalCount = 50; // Number of sparks

  // Refs for the fire container to manage animations more efficiently
  const fireContainerRef = useRef<HTMLDivElement>(null);

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

    // Set loaded state after component mounts for entrance animations
    setLoaded(true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Create a dynamic flame wrapper element
  const FlameWrapper = ({ index }: { index: number }) => {
    // Distribute flame wrappers evenly
    const leftPosition = (index / flameTotalCount) * 100;
    // Randomize animation delays for natural flame movement
    const animationDelay = -(Math.random() * 2).toFixed(1);

    return (
      <div
        className="flame-wrapper"
        style={{
          left: `${leftPosition}%`,
          animationDelay: `${animationDelay}s`,
          // Add some randomness to scale for varied flame sizes
          transform: `scale(${0.8 + Math.random() * 0.8}, ${
            1 + Math.random() * 0.5
          })`,
        }}
      >
        <div className="flame red"></div>
        <div className="flame orange"></div>
        <div className="flame gold"></div>
        <div className="flame white"></div>
      </div>
    );
  };

  // Create a spark element
  const Spark = ({ index }: { index: number }) => {
    // Generate random properties for each spark
    const leftPosition = Math.random() * 100;
    const animationDuration = (0.5 + Math.random() * 2).toFixed(2);
    const animationDelay = (Math.random() * 2).toFixed(2);
    const size = 1 + Math.random() * 2; // Varied spark sizes

    return (
      <div
        className="spark"
        style={{
          left: `${leftPosition}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`,
        }}
      />
    );
  };

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
        {/* Advanced fire effect container */}
        <div
          className="absolute inset-x-0 bottom-0 z-0 fire-container"
          ref={fireContainerRef}
        >
          {/* Base layer with multiple realistic flame clusters */}
          <div className="fire-base">
            {/* Dynamic flame wrappers */}
            {isClient &&
              Array.from({ length: flameTotalCount }).map((_, i) => (
                <FlameWrapper key={`flame-${i}`} index={i} />
              ))}
          </div>

          {/* Ember and spark effects */}
          {isClient &&
            Array.from({ length: sparkTotalCount }).map((_, i) => (
              <Spark key={`spark-${i}`} index={i} />
            ))}

          {/* Secondary sparks (smaller, faster) */}
          {isClient &&
            Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`tiny-spark-${i}`}
                className="tiny-spark"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${0.3 + Math.random() * 1}s`,
                  animationDelay: `${Math.random() * 1}s`,
                }}
              />
            ))}

          {/* Smoke effect overlays */}
          <div className="smoke-layer"></div>

          {/* Fire glow effect */}
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
              <div className="scroll-handle scroll-handle-left">
                <div className="scroll-handle-detail"></div>
              </div>

              {/* Main parchment area with ThisDayInHistory */}
              <div className="scroll-content">
                {/* ThisDayInHistory component inside the scroll */}
                <div className="history-in-scroll">
                  <ThisDayInHistory />
                </div>
              </div>

              {/* Right scroll handle */}
              <div className="scroll-handle scroll-handle-right">
                <div className="scroll-handle-detail"></div>
              </div>
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
