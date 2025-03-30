"use client";

import { useState, useEffect } from "react";

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

  // Format date as "Month Day" (e.g., "March 27")
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
      "3-27": [
        {
          year: "1964",
          description:
            "The Great Alaskan Earthquake, the most powerful in North American history, strikes with a magnitude of 9.2",
        },
        {
          year: "1977",
          description:
            "The deadliest aviation accident in history occurs at Tenerife Airport, killing 583 people",
        },
      ],
      "3-28": [
        {
          year: "1979",
          description:
            "The Three Mile Island nuclear accident occurs near Harrisburg, Pennsylvania",
        },
        {
          year: "1854",
          description:
            "Britain and France declare war on Russia, beginning the Crimean War",
        },
      ],
      "3-29": [
        {
          year: "1973",
          description:
            "The last U.S. troops withdraw from Vietnam, ending America's direct military involvement",
        },
        {
          year: "1974",
          description:
            "NASA's Mariner 10 becomes the first spacecraft to fly by Mercury",
        },
      ],
      "3-30": [
        {
          year: "1981",
          description:
            "President Ronald Reagan is shot and wounded by John Hinckley Jr. in Washington, D.C.",
        },
        {
          year: "1867",
          description:
            "The United States purchases Alaska from Russia for $7.2 million",
        },
      ],
      "3-31": [
        {
          year: "1889",
          description: "The Eiffel Tower is officially opened in Paris",
        },
        {
          year: "1918",
          description:
            "Daylight Saving Time goes into effect for the first time in the United States",
        },
      ],
      "4-1": [
        {
          year: "1976",
          description:
            "Apple Computer Company is formed by Steve Jobs and Steve Wozniak",
        },
        {
          year: "1945",
          description:
            "The Battle of Okinawa begins, one of the largest amphibious assaults in the Pacific Theater",
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
          year: currentDate.getFullYear().toString(),
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
    <section className="bg-amber-50 p-4 rounded-lg mb-8 shadow-md">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-slate-800">
            This Day in History: {formattedDate}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-600"
            >
              {event.year && (
                <div className="text-lg font-bold text-blue-800 mb-1">
                  {event.year}
                </div>
              )}
              <p className="text-slate-700 text-sm">{event.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 text-center">
          <a
            href="/history/on-this-day"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
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
          </a>
        </div>
      </div>
    </section>
  );
}
