// src/app/eras/page.tsx
import Link from "next/link";

// Sample data for all eras
const allEras = [
  {
    slug: "early-civilizations",
    title: "Early Civilizations",
    period: "3000 BCE - 1200 BCE",
    description:
      "The dawn of human civilization, featuring the rise of the first cities, writing systems, and complex societies in Mesopotamia, Egypt, Indus Valley, and China.",
    color: "bg-amber-500",
  },
  {
    slug: "rise-of-empires",
    title: "Rise of Empires",
    period: "1200 BCE - 500 BCE",
    description:
      "The age of the first great empires, including Assyria, Babylon, and early Persian Empire, alongside developments in Greek city-states and Zhou Dynasty China.",
    color: "bg-red-600",
  },
  {
    slug: "classical-empires",
    title: "Classical Empires",
    period: "500 BCE - 500 CE",
    description:
      "The height of Greco-Roman civilization, Han China, Mauryan and Gupta India, featuring unprecedented cultural, philosophical, and technological advancements.",
    color: "bg-purple-600",
  },
  {
    slug: "rise-of-religion",
    title: "Rise of Religion",
    period: "300 CE - 800 CE",
    description:
      "The spread of Christianity, Islam, and Buddhism, alongside the fall of the Western Roman Empire and the emergence of new political orders across Eurasia.",
    color: "bg-indigo-600",
  },
  {
    slug: "renaissance",
    title: "Renaissance",
    period: "1400 - 1700 CE",
    description:
      "European cultural, artistic, and scientific rebirth after the Middle Ages, featuring the Protestant Reformation and the Age of Exploration.",
    color: "bg-green-600",
  },
  {
    slug: "era-of-revolutions",
    title: "Era of Revolutions",
    period: "1700 - 1900 CE",
    description:
      "Political and industrial transformations that reshaped governance, technology, economy, and society, including the American, French, and Industrial Revolutions.",
    color: "bg-blue-600",
  },
  {
    slug: "common-era",
    title: "Common Era",
    period: "1900 - Present",
    description:
      "Our modern world, shaped by world wars, technological revolution, decolonization, globalization, and unprecedented social and environmental challenges.",
    color: "bg-gray-700",
  },
];

export default function ErasIndexPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Historical Eras</h1>
          <p className="text-xl text-gray-600">
            Explore the vast tapestry of human history through our comprehensive
            guides to major historical periods
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {allEras.map((era) => (
            <Link
              key={era.slug}
              href={`/eras/${era.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`${era.color} h-24 relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white">{era.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  {era.period}
                </p>
                <p className="text-gray-700">{era.description}</p>
                <div className="mt-4 text-blue-600 group-hover:text-blue-800 flex items-center">
                  <span>Explore this era</span>
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
            multiple eras and civilizations throughout human history.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/eras/classical-empires/timeline"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Interactive Timelines
            </Link>
            <Link
              href="/eras/comparative"
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
