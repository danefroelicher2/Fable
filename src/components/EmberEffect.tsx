// src/components/EmberEffect.tsx
"use client";

import styles from "./EmberEffect.module.css";

export default function EmberEffect() {
  // Generate more ember particles (30 instead of 20) for a more dramatic effect
  const emberElements = Array.from({ length: 30 }, (_, i) => {
    const size = 3 + Math.random() * 6; // Larger size between 3-9px
    const left = Math.random() * 100; // Random horizontal position
    const animationDelay = Math.random() * 5; // Shorter delay up to 5s for more frequent embers
    const animationDuration = 5 + Math.random() * 10; // Faster animation between 5-15s

    return (
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
  });

  return (
    <div className={styles.emberContainer}>
      {emberElements}
      <div className={styles.emberGlow} />
    </div>
  );
}
