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
  const shootingStarCount = 5; // Number of shooting stars

  // Refs for the fire container to manage animations more efficiently
  const fireContainerRef = useRef<HTMLDivElement>(null);
  const starryNightRef = useRef<HTMLDivElement>(null);

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

    // Create shooting stars at random intervals
    const shootingStarInterval = setInterval(() => {
      if (starryNightRef.current) {
        createShootingStar();
      }
    }, 2000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(shootingStarInterval);
    };
  }, []);

  // Create a shooting star element
  const createShootingStar = () => {
    if (!starryNightRef.current || !isClient) return;

    // Create the shooting star element
    const star = document.createElement("div");
    star.className = "shooting-star";

    // Random position, angle, and speed
    const startTop = Math.random() * 50; // Start from top half of the screen
    const startLeft = Math.random() * 100;
    const angle = Math.random() * 60 - 30; // -30 to 30 degrees
    const length = 50 + Math.random() * 150; // Length of the shooting star
    const travelDistance = 200 + Math.random() * 200; // How far it travels
    const travelHeight = Math.tan((angle * Math.PI) / 180) * travelDistance;
    const duration = 0.5 + Math.random() * 1; // Animation duration in seconds

    // Set styles
    star.style.top = `${startTop}%`;
    star.style.left = `${startLeft}%`;
    star.style.width = `${length}px`;
    star.style.transform = `rotate(${angle}deg)`;
    star.style.setProperty("--travel-distance", `${travelDistance}px`);
    star.style.setProperty("--travel-height", `${travelHeight}px`);
    star.style.animationDuration = `${duration}s`;

    // Add to the container and remove when animation ends
    starryNightRef.current.appendChild(star);
    setTimeout(() => {
      star.remove();
    }, duration * 1000);
  };

  // Create jagged flame elements
  const createJaggedFlames = () => {
    if (!isClient) return null;

    const flames = [];

    for (let i = 0; i < flameTotalCount; i++) {
      const leftPosition = (i / flameTotalCount) * 100; // Distribute evenly across container
      const randomScale = 0.8 + Math.random() * 0.8; // Random scale factor
      const randomDelay = -(Math.random() * 2).toFixed(1); // Random animation delay

      flames.push(
        <div
          key={`flame-${i}`}
          className="jagged-flame-container"
          style={{
            left: `${leftPosition}%`,
            animationDelay: `${randomDelay}s`,
            transform: `scale(${randomScale}, ${1 + Math.random() * 0.5})`,
          }}
        >
          <div className="jagged-flame jagged-flame-outer"></div>
          <div className="jagged-flame jagged-flame-inner"></div>
          <div className="jagged-flame jagged-flame-core"></div>
        </div>
      );
    }

    return flames;
  };

  // Create spark elements
  const createSparks = () => {
    if (!isClient) return null;

    const sparks = [];

    for (let i = 0; i < sparkTotalCount; i++) {
      const leftPosition = Math.random() * 100; // Random horizontal position
      const size = 1 + Math.random() * 2; // Random size
      const animationDuration = (0.5 + Math.random() * 2).toFixed(2); // Random duration
      const animationDelay = (Math.random() * 2).toFixed(2); // Random delay
      const randomFactor = Math.random(); // Random factor for trajectory

      sparks.push(
        <div
          key={`spark-${i}`}
          className="spark"
          style={
            {
              left: `${leftPosition}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
              "--random": randomFactor,
            } as React.CSSProperties
          }
        />
      );
    }

    return sparks;
  };

  return (
    <div className="scroll-landing-container flex flex-col w-full">
      {/* Unified starry night background that spans the entire component */}
      <div className="starry-night-background" ref={starryNightRef}>
        {/* Static stars background */}
        <div className="stars-layer"></div>
        <div className="stars-layer-bottom"></div>

        {/* Twinkling stars animation */}
        <div className="twinkling-stars"></div>

        {/* Nebula effect (colorful clouds) */}
        <div className="nebula-effect"></div>

        {/* Nebula dust particles */}
        <div className="nebula-dust"></div>

        {/* Shooting stars will be added dynamically */}
      </div>

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
        {/* Fire effects container */}
        <div
          className="absolute inset-x-0 bottom-0 fire-container"
          ref={fireContainerRef}
        >
          <div className="fire-base">
            {/* Jagged flames rendered by createJaggedFlames function */}
            {createJaggedFlames()}
          </div>

          {/* Sparks generated by createSparks function */}
          {createSparks()}

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
