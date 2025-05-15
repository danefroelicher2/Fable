// src/components/ImprovedScrollLanding.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import "./ImprovedScrollLanding.css";

const ImprovedScrollLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Using useMemo to calculate fire particle props once
  const fireParticles = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      left: Math.floor(Math.random() * 100),
      duration: 2 + Math.floor(Math.random() * 3),
      delay: Math.floor(Math.random() * 2),
      width: 30 + Math.floor(Math.random() * 40), // Wider particles
      height: 80 + Math.floor(Math.random() * 120), // Taller, more vertical flames
    }));
  }, []);

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

  return (
    <div className="flex flex-col w-full">
      {/* Top section with LostLibrary title - now larger, with reduced height */}
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
        {/* Fire effect background behind the scroll */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute bottom-0 w-full h-full fire-background">
            <div className="fire-container">
              {/* Only render particles on client-side to avoid hydration issues */}
              {isClient &&
                fireParticles.map((particle, i) => (
                  <div
                    key={i}
                    className="fire-particle sharp-flame"
                    style={{
                      left: `${particle.left}%`,
                      animationDuration: `${particle.duration}s`,
                      animationDelay: `${particle.delay}s`,
                      width: `${particle.width}px`,
                      height: `${particle.height}px`,
                    }}
                  />
                ))}
            </div>
          </div>
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
            {/* Scroll with handles - using images more similar to the references */}
            <div className="realistic-scroll">
              {/* Left scroll handle */}
              <div className="scroll-handle scroll-handle-left"></div>

              {/* Main parchment area - now contains This Day in History */}
              <div className="scroll-content">
                {/* Using the ThisDayInHistory component inside the scroll */}
                <div className="history-in-scroll">
                  <ThisDayInHistory />
                </div>
              </div>

              {/* Right scroll handle */}
              <div className="scroll-handle scroll-handle-right"></div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - kept for visual effect */}
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
