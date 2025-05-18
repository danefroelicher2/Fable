// src/components/EmberEffect.tsx
"use client";

import { useEffect, useState, ReactElement } from "react";
import styles from "./EmberEffect.module.css";

export default function EmberEffect() {
  const [embers, setEmbers] = useState<ReactElement[]>([]);

  useEffect(() => {
    // Generate 20 ember particles with random positions and animations
    const emberElements: ReactElement[] = [];
    for (let i = 0; i < 20; i++) {
      const size = 2 + Math.random() * 4; // Random size between 2-6px
      const left = Math.random() * 100; // Random horizontal position
      const animationDelay = Math.random() * 10; // Random delay up to 10s
      const animationDuration = 10 + Math.random() * 15; // Random duration between 10-25s

      emberElements.push(
        <div
          key={i}
          className={styles.ember}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`,
          }}
        />
      );
    }
    setEmbers(emberElements);
  }, []);

  return (
    <div className={styles.emberContainer}>
      {embers}
      <div className={styles.emberGlow} />
    </div>
  );
}
