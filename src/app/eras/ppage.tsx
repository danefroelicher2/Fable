// src/app/eras/page.tsx
import Link from "next/link";

// Define our available eras (same as in [eraSlug]/page.tsx)
const eras = {
  "early-civilizations": {
    title: "Early Civilizations",
    period: "3000 BCE - 1200 BCE",
    description:
      "The emergence of the first complex societies in Mesopotamia, Egypt, the Indus Valley, and China.",
  },
  "rise-of-empires": {
    title: "Rise of Empires",
    period: "1200 BCE - 500 BCE",
    description:
      "The formation of early empires and the widespread use of iron technology.",
  },
  "classical-empires": {
    title: "Classical Empires",
    period: "500 BCE - 500 CE",
    description:
      "The age of the great classical civilizations of Greece, Rome, Persia, India, and China.",
  },
  "rise-of-religion": {
    title: "Rise of Religion",
    period: "300 CE - 800 CE",
    description:
      "The spread of world religions including Christianity, Islam, and Buddhism.",
  },
  renaissance: {
    title: "Renaissance",
    period: "1400 - 1700 CE",
    description:
      "A period of cultural rebirth and artistic innovation in Europe.",
  },
  "era-of-revolutions": {
    title: "Era of Revolutions",
    period: "1700 - 1900 CE",
    description:
      "Political and industrial revolutions that transformed society.",
  },
  "common-era": {
    title: "Common Era",
    period: "1900 - Present",
    description:
      "The modern era characterized by world wars, technological advances, and globalization.",
  },
};

export default function ErasPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Historical Eras</h1>
        <p className="text-xl text-gray-600 mb-10 text-center">
          Explore history through major periods of human civilization
        </p>

        <div className="grid grid-cols-1 gap-6">
          {Object.entries(eras).map(([slug, era]) => (
            <Link
              key={slug}
              href={`/eras/${slug}`}
              className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow article-card"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{era.title}</h2>
                <p className="text-gray-500 mb-3">{era.period}</p>
                <p className="text-gray-700">{era.description}</p>
                <div className="mt-4 text-blue-600 font-medium">
                  Explore this era →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
