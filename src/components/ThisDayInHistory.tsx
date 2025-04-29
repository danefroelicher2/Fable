// src/components/ThisDayInHistory.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoricalEvent {
  year: string;
  description: string;
}

export default function ThisDayInHistory() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<HistoricalEvent[]>([]);

  useEffect(() => {
    // Set current date
    setCurrentDate(new Date());

    // Get historical events for today
    const todaysEvents = getHistoricalEvents(currentDate);
    setEvents(todaysEvents);
  }, []);

  // Format date as "Month Day" (e.g., "April 29")
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // Function to get historical events for current date
  const getHistoricalEvents = (date: Date): HistoricalEvent[] => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();

    // Database of historical events by date
    const historicalEventsByDate: Record<string, HistoricalEvent[]> = {
      // Format: "month-day": [events]
      "4-29": [
        {
          year: "1945",
          description:
            "In World War II, American soldiers liberate the Dachau concentration camp.",
        },
        {
          year: "1975",
          description:
            "Operation Frequent Wind, the U.S. evacuation of Saigon, begins as North Vietnamese forces advance on the city.",
        },
        {
          year: "1992",
          description:
            "Riots break out in Los Angeles following the acquittal of police officers charged with excessive force in the beating of Rodney King.",
        },
      ],
      "4-28": [
        {
          year: "1789",
          description:
            "Mutiny on the HMS Bounty: Lieutenant William Bligh and 18 sailors are set adrift by the rebellious crew led by Fletcher Christian.",
        },
        {
          year: "1947",
          description:
            "Thor Heyerdahl and five crew members set out from Peru on the Kon-Tiki to prove that Polynesians could have traveled from South America.",
        },
      ],
      "4-30": [
        {
          year: "1789",
          description:
            "George Washington is inaugurated as the first President of the United States.",
        },
        {
          year: "1975",
          description:
            "Fall of Saigon: The Vietnam War ends as Communist forces take Saigon, leading to the eventual reunification of Vietnam.",
        },
      ],
      // Add more dates as needed
    };

    // Create a key in the format "month-day"
    const dateKey = `${month}-${day}`;

    // Return events for today's date, or default events if none exist
    return (
      historicalEventsByDate[dateKey] || [
        {
          year: "2025",
          description: "No major historical events recorded for today",
        },
        {
          year: "",
          description: "Check back tomorrow for new historical facts",
        },
      ]
    );
  };

  return (
    <section className="bg-amber-50 dark:bg-amber-950 p-6 rounded-lg mb-8 shadow-md">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-100">
            This Day in History: {formattedDate}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-600 dark:border-blue-500"
            >
              {event.year && (
                <div className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-1">
                  {event.year}
                </div>
              )}
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                {event.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/history/on-this-day"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center"
          >
            More historical events
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
