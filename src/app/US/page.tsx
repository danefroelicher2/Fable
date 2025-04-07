// src/app/us-history/page.tsx
import Link from "next/link";

// Sample data for U.S. History topics
const allUSHistoryTopics = [
  {
    slug: "colonial-america",
    title: "Colonial America",
    period: "1492 - 1763",
    description:
      "European colonization, Indigenous encounters, and the formation of distinct colonial societies that would become the United States.",
    color: "bg-amber-500",
  },
  {
    slug: "american-revolution",
    title: "American Revolution",
    period: "1765 - 1783",
    description:
      "The struggle for independence, political transformation, and the birth of a new nation challenging British colonial rule.",
    color: "bg-red-600",
  },
  {
    slug: "early-us",
    title: "Early U.S.",
    period: "1783 - 1815",
    description:
      "The formative years of the new republic, including the Constitution, early political developments, and national growth.",
    color: "bg-purple-600",
  },
  {
    slug: "slavery",
    title: "Slavery",
    period: "1619 - 1865",
    description:
      "The institution of slavery, its economic and social impacts, resistance, and the path to abolition in American society.",
    color: "bg-indigo-600",
  },
  {
    slug: "civil-war",
    title: "Civil War",
    period: "1861 - 1865",
    description:
      "The defining conflict over national unity, states' rights, and the future of slavery that reshaped the United States.",
    color: "bg-green-600",
  },
  {
    slug: "great-depression",
    title: "Great Depression",
    period: "1929 - 1939",
    description:
      "Economic crisis, social transformation, and the comprehensive governmental response that redefined American society.",
    color: "bg-blue-600",
  },
  {
    slug: "us-government",
    title: "U.S. Government",
    period: "Ongoing",
    description:
      "The evolving political system, constitutional principles, and the complex mechanisms of American democratic governance.",
    color: "bg-gray-700",
  },
];

export default function USHistoryIndexPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">U.S. History</h1>
          <p className="text-xl text-gray-600">
            All the major chapters in the American story, from Indigenous
            beginnings to the present day
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {allUSHistoryTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/us-history/${topic.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`${topic.color} h-24 relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white">
                    {topic.title}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  {topic.period}
                </p>
                <p className="text-gray-700">{topic.description}</p>
                <div className="mt-4 text-blue-600 group-hover:text-blue-800 flex items-center">
                  <span>Explore this topic</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Timelines & Comparative History
          </h2>
          <p className="text-lg mb-6">
            Explore our interactive timelines and comparative analyses that span
            multiple periods and themes throughout American history.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/us-history/presidential-timeline"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Interactive Timelines
            </Link>
            <Link
              href="/us-history/comparative"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Comparative History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
