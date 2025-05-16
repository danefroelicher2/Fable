// This is a simplified implementation of the useZoom hook
// Place this in src/hooks/useZoom.ts

import { useState, useEffect } from "react";

/**
 * Custom hook to detect approximate zoom level based on viewport height
 * @param threshold The viewport height threshold to determine if showing the More button
 * @returns A boolean indicating if the More button should be shown
 */
export function useZoom(threshold = 900) {
  const [showMoreButton, setShowMoreButton] = useState(true);

  useEffect(() => {
    // Function to check viewport size and estimate zoom level
    const checkZoomLevel = () => {
      // We use viewport height as a proxy for zoom level
      // If viewport height is larger than threshold, we assume zoom is low enough to show all items
      if (window.innerHeight > threshold) {
        setShowMoreButton(false);
      } else {
        setShowMoreButton(true);
      }
    };

    // Check on mount
    checkZoomLevel();

    // Add event listener for resize events (which happen on zoom changes)
    window.addEventListener("resize", checkZoomLevel);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkZoomLevel);
    };
  }, [threshold]);

  return showMoreButton;
}
