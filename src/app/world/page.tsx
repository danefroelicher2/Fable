// src/app/world/page.tsx
import Link from "next/link";

// Sample data for all world regions
const worldRegions = [
  {
    slug: "ancient",
    title: "Ancient Civilizations",
    period: "3000 BCE - 500 CE",
    description:
      "Explore the early civilizations that laid the foundations for human society, including Mesopotamia, Ancient Egypt, Greece, Rome, and more.",
    color: "bg-amber-500",
  },
  {
    slug: "europe",
    title: "European History",
    period: "500 CE - Present",
    description:
      "From the medieval period through Renaissance, Enlightenment, and the modern era, explore the complex history of the European continent.",
    color: "bg-blue-600",
  },
  {
    slug: "asia",
    title: "Asian History",
    period: "3000 BCE - Present",
    description:
      "Discover the rich histories of civilizations across East Asia, South Asia, and Southeast Asia, including China, Japan, India, and more.",
    color: "bg-red-600",
  },
  {
    slug: "africa",
    title: "African History",
    period: "3000 BCE - Present",
    description:
      "Uncover the diverse histories of African kingdoms, empires, and cultures, from ancient Egypt to the colonial era and independence movements.",
    color: "bg-green-600",
  },
  {
    slug: "latin-america",
    title: "Latin American History",
    period: "1500 CE - Present",
    description:
      "Explore the pre-Columbian civilizations, colonial period, independence movements, and modern history of countries in Central and South America.",
    color: "bg-yellow-600",
  },
  {
    slug: "middle-east",
    title: "Middle Eastern History",
    period: "3000 BCE - Present",
    description:
      "From the cradle of civilization to the modern era, explore the complex history of the Middle East, including the Persian Empire, Islamic Golden Age, and Ottoman Empire.",
    color: "bg-purple-600",
  },
  {
    slug: "ww1",
    title: "World War I",
    period: "1914 - 1918",
    description:
      "Examine the global conflict that reshaped the world order, introducing modern warfare and setting the stage for future conflicts.",
    color: "bg-gray-700",
  },
  {
    slug: "ww2",
    title: "World War II",
    period: "1939 - 1945",
    description:
      "Study the most widespread and deadliest conflict in human history, which involved more than 30 countries and shaped the modern world.",
    color: "bg-red-700",
  },
  {
    slug: "cold-war",
    title: "Cold War",
    period: "1947 - 1991",
    description:
      "Explore the political and ideological struggle between the United States and the Soviet Union that dominated global politics for nearly half a century.",
    color: "bg-blue-700",
  },
];

export default function WorldIndexPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">World History</h1>
          <p className="text-xl text-gray-600">
            Explore the diverse histories of regions, countries, and global
            events that have shaped our world
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {worldRegions.map((region) => (
            <Link
              key={region.slug}
              href={`/world/${region.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`${region.color} h-24 relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white">
                    {region.title}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  {region.period}
                </p>
                <p className="text-gray-700">{region.description}</p>
                <div className="mt-4 text-blue-600 group-hover:text-blue-800 flex items-center">
                  <span>Explore this region</span>
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
            Global Perspectives & Comparative Studies
          </h2>
          <p className="text-lg mb-6">
            Explore our cross-cultural studies and resources that examine
            historical connections between different world regions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/world/comparative"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Comparative Studies
            </Link>
            <Link
              href="/world/global-history"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Global History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
