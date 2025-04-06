import Link from "next/link";

// Sample region titles for reference
const regionTitles: Record<string, string> = {
  europe: "European History",
  asia: "Asian History",
  africa: "African History",
  americas: "History of the Americas",
  "middle-east": "Middle Eastern History",
  oceania: "Oceania History",
  global: "Global History",
};

// Define the Event type
type Event = {
  year: string;
  event: string;
  importance: "high" | "medium" | "low";
  location: string;
};

// Sample historical events data for each region
const eventsByRegion: Record<string, Event[]> = {
  europe: [
    {
      year: "476 CE",
      event: "Fall of the Western Roman Empire",
      importance: "high",
      location: "Italy",
    },
    // ... (rest of the Europe events remain the same)
  ],
  asia: [
    {
      year: "221 BCE",
      event: "Qin Shi Huang unifies China, becomes first emperor",
      importance: "high",
      location: "China",
    },
    // ... (rest of the Asia events remain the same)
  ],
  // ... (other regions with their events)
  // Make sure to include all regions from the original code
};

export default function RegionPage({ params }: { params: { region: string } }) {
  const { region } = params;
  const regionTitle = regionTitles[region] || "Regional History";
  const events = eventsByRegion[region] || [];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center text-sm mb-2">
            <Link href="/world" className="text-blue-600 hover:text-blue-800">
              World History
            </Link>
            <span className="mx-2">›</span>
            <span>{regionTitle}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{regionTitle}</h1>
          <p className="text-gray-600">
            Explore the rich history and key events that shaped{" "}
            {regionTitle.toLowerCase()}.
          </p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-2xl font-bold mb-4">Key Historical Events</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-4 text-left">Year</th>
                  <th className="py-2 px-4 text-left">Event</th>
                  <th className="py-2 px-4 text-left">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event: Event, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{event.year}</td>
                    <td className="py-3 px-4">{event.event}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {event.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Explore Further</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/world/${region}/civilization`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Civilizations & Empires</span>
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
              </li>
              <li>
                <Link
                  href={`/world/${region}/timeline`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Interactive Timeline</span>
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
              </li>
              <li>
                <Link
                  href={`/world/${region}/figures`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Historical Figures</span>
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
              </li>
              <li>
                <Link
                  href={`/world/${region}/artifacts`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Artifacts & Archaeology</span>
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
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Related Categories</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/wars"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Wars & Conflicts
                </Link>
              </li>
              <li>
                <Link
                  href="/religion"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Religious History
                </Link>
              </li>
              <li>
                <Link
                  href="/culture"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Cultural Developments
                </Link>
              </li>
              <li>
                <Link
                  href="/science-innovation"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Scientific Advancements
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/world"
            className="inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to World History
          </Link>
        </div>
      </div>
    </div>
  );
}
