// src/components/ThisDayInHistory.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoricalEvent {
  year: string;
  text: string;
  html: string;
  no_year_html: string;
  links: Array<{
    title: string;
    link: string;
  }>;
}

interface HistoryAPIResponse {
  date: string;
  url: string;
  data: {
    Events: HistoricalEvent[];
    Births: HistoricalEvent[];
    Deaths: HistoricalEvent[];
  };
}

export default function ThisDayInHistory() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set current date
    const today = new Date();
    setCurrentDate(today);

    // Fetch historical events for today
    fetchHistoricalEvents(today);
  }, []);

  // Format date as "Month Day" (e.g., "April 29")
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // Function to fetch real historical events from API
  const fetchHistoricalEvents = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const day = date.getDate();

      // Using History Muffin Labs API - free and reliable
      const response = await fetch(
        `https://history.muffinlabs.com/date/${month}/${day}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HistoryAPIResponse = await response.json();

      // Get the most significant events (first 2 from the Events array)
      // These are typically ordered by historical significance
      const significantEvents = data.data.Events.slice(0, 2);

      setEvents(significantEvents);
    } catch (err) {
      console.error("Error fetching historical events:", err);
      setError("Failed to load historical events");

      // Fallback to some default events if API fails
      setEvents([
        {
          year: "2025",
          text: "Unable to load historical events for today",
          html: "Unable to load historical events for today",
          no_year_html: "Unable to load historical events for today",
          links: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to clean up the event text (remove extra formatting)
  const cleanEventText = (text: string) => {
    // Remove any HTML tags and clean up the text
    return text.replace(/<[^>]*>/g, "").trim();
  };

  // Function to get a shorter, more readable version of the event
  const formatEventForDisplay = (event: HistoricalEvent) => {
    const cleanText = cleanEventText(event.text);
    // If the text is too long, truncate it
    if (cleanText.length > 150) {
      return cleanText.substring(0, 147) + "...";
    }
    return cleanText;
  };

  return (
    <section className="bg-amber-50 dark:bg-amber-950 p-6 rounded-lg mb-8 shadow-md">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-100">
            This Day in History: {formattedDate}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-600 dark:border-blue-500"
              >
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              <p className="font-medium">Unable to load historical events</p>
              <p className="text-sm mt-1">
                Please check your internet connection and try again later.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-600 dark:border-blue-500"
              >
                {event.year && (
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-2">
                    {event.year}
                  </div>
                )}
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                  {formatEventForDisplay(event)}
                </p>

                {/* Show related links if available */}
                {event.links && event.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.links.slice(0, 2).map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Removed "More historical events" button as requested */}
      </div>
    </section>
  );
}
