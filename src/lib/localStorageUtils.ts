// src/lib/localStorageUtils.ts

/**
 * Safely gets an item from localStorage, handling SSR environments
 * @param key The key to get from localStorage
 * @param defaultValue The default value to return if the key doesn't exist or localStorage is not available
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    // Try to parse the item as JSON
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      // If it's not valid JSON, return the raw value (for strings)
      return item as unknown as T;
    }
  } catch (e) {
    console.error(`Error accessing localStorage for key ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Safely sets an item in localStorage, handling SSR environments
 * @param key The key to set in localStorage
 * @param value The value to set
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    // Convert object/array values to JSON strings
    const valueToStore =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (e) {
    console.error(`Error saving to localStorage for key ${key}:`, e);
    return false;
  }
}

/**
 * Safely removes an item from localStorage, handling SSR environments
 * @param key The key to remove from localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing from localStorage for key ${key}:`, e);
    return false;
  }
}
