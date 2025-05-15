// src/components/ImprovedScrollLanding.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import "./ImprovedScrollLanding.css";

const ImprovedScrollLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Using useMemo to calculate fire particle props once
  const fireParticles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.floor(Math.random() * 100),
      duration: 2 + Math.floor(Math.random() * 3),
      delay: Math.floor(Math.random() * 2),
      width: 20 + Math.floor(Math.random() * 30),
      height: 40 + Math.floor(Math.random() * 60),
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
    <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Fire effect background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-orange-900 via-orange-800 to-transparent opacity-50">
          <div className="fire-container">
            {/* Only render particles on client-side to avoid hydration issues */}
            {isClient &&
              fireParticles.map((particle, i) => (
                <div
                  key={i}
                  className="fire-particle"
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

      {/* Realistic scroll container based on provided images */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-auto transform transition-all duration-1000 px-4
          ${
            scrolled
              ? "translate-y-[-50px] scale-90 opacity-80"
              : "translate-y-0 scale-100 opacity-100"
          }
          ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      >
        <div className="realistic-scroll-container">
          {/* Scroll with handles - using images more similar to the references */}
          <div className="realistic-scroll">
            {/* Left scroll handle */}
            <div className="scroll-handle scroll-handle-left"></div>

            {/* Main parchment area */}
            <div className="scroll-content">
              <h1 className="font-cursive text-5xl sm:text-6xl md:text-7xl text-center mb-6 text-amber-900 tracking-wide glow-effect">
                LostLibrary
              </h1>
              <p className="aged-text text-lg text-center mb-8 max-w-md px-4">
                Discover the forgotten tales of history, preserved for
                generations to come
              </p>
              <div className="text-center">
                <button className="bg-amber-900 text-amber-50 px-8 py-3 rounded-full text-lg font-medium hover:bg-amber-800 transition-colors shadow-md">
                  Begin Your Journey
                </button>
              </div>
            </div>

            {/* Right scroll handle */}
            <div className="scroll-handle scroll-handle-right"></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
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
  );
};

export default ImprovedScrollLanding;
