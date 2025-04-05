// src/app/eras/[slug]/page.tsx
import Link from "next/link";

// Sample data for each era
const eraData = {
  "early-civilizations": {
    title: "Early Civilizations",
    period: "3000 BCE - 1200 BCE",
    description:
      "The period saw the rise of the first major civilizations in Mesopotamia, Egypt, India, and China. These early societies developed writing systems, complex social hierarchies, and monumental architecture.",
    keyEvents: [
      "3500-3000 BCE: Development of writing in Mesopotamia",
      "3100 BCE: Unification of Upper and Lower Egypt",
      "2700-2500 BCE: Construction of the Great Pyramids in Egypt",
      "2500 BCE: Height of the Indus Valley Civilization",
      "2200 BCE: Fall of the Akkadian Empire",
      "1800-1600 BCE: Rise of Babylon under Hammurabi",
    ],
  },
  "rise-of-empires": {
    title: "Rise of Empires",
    period: "1200 BCE - 500 BCE",
    description:
      "This era witnessed the emergence of the first vast territorial empires, along with major cultural and religious developments across Eurasia.",
    keyEvents: [
      "1200-1150 BCE: Bronze Age collapse and the fall of many Mediterranean civilizations",
      "1046 BCE: Beginning of the Zhou Dynasty in China",
      "1000-587 BCE: Kingdom of Israel and Judah",
      "814 BCE: Traditional founding of Carthage",
      "753 BCE: Traditional founding of Rome",
      "550-530 BCE: Rise of the Persian Empire under Cyrus the Great",
    ],
  },
  "classical-empires": {
    title: "Classical Empires",
    period: "500 BCE - 500 CE",
    description:
      "The Classical Period saw the height of Greek and Roman civilization, the rise of major empires across multiple continents, and significant philosophical and religious developments.",
    keyEvents: [
      "508 BCE: Establishment of Athenian democracy",
      "490-479 BCE: Greco-Persian Wars",
      "327-325 BCE: Alexander the Great's campaign in India",
      "221 BCE: Qin Shi Huang unifies China",
      "44 BCE: Assassination of Julius Caesar",
      "27 BCE - 14 CE: Reign of Augustus, first Roman Emperor",
      "476 CE: Fall of the Western Roman Empire",
    ],
  },
  "rise-of-religion": {
    title: "Rise of Religion",
    period: "300 CE - 800 CE",
    description:
      "This period saw the spread of major world religions, the fall of Rome, and the emergence of post-classical civilizations across Eurasia and Africa.",
    keyEvents: [
      "313 CE: Edict of Milan legalizes Christianity in the Roman Empire",
      "395 CE: Permanent division of the Roman Empire",
      "570-632 CE: Life of Muhammad, founder of Islam",
      "632-661 CE: The Rashidun Caliphate and early Islamic conquests",
      "618-907 CE: Tang Dynasty in China",
      "800 CE: Coronation of Charlemagne as Holy Roman Emperor",
    ],
  },
  renaissance: {
    title: "Renaissance",
    period: "1400 - 1700 CE",
    description:
      "The Renaissance was a period of intense artistic and intellectual activity, first beginning in Italy in the 14th century. A cultural rebirth spread across Europe through the 16th century.",
    keyEvents: [
      "1450: Johannes Gutenberg invents the printing press",
      "1453: Fall of Constantinople to the Ottoman Turks",
      "1492: Christopher Columbus reaches the Americas",
      "1517: Martin Luther posts the 95 Theses, starting the Protestant Reformation",
      "1543: Publication of Copernicus's heliocentric model",
      "1558-1603: Reign of Elizabeth I of England",
      "1642-1651: English Civil War",
    ],
  },
  "era-of-revolutions": {
    title: "Era of Revolutions",
    period: "1700 - 1900 CE",
    description:
      "This era saw dramatic political and industrial revolutions that transformed governance, technology, and everyday life across the world.",
    keyEvents: [
      "1776: American Declaration of Independence",
      "1789: Beginning of the French Revolution",
      "1804: Haitian independence, establishing the first Black republic",
      "1815: Congress of Vienna redraws European borders after Napoleonic Wars",
      "1848: Wave of revolutions across Europe",
      "1861-1865: American Civil War",
      "1868: Meiji Restoration in Japan",
    ],
  },
  "common-era": {
    title: "Common Era",
    period: "1900 - Present",
    description:
      "The modern era has been characterized by rapid technological development, devastating world wars, decolonization, and globalization.",
    keyEvents: [
      "1914-1918: World War I",
      "1917: Russian Revolution",
      "1929-1939: Great Depression",
      "1939-1945: World War II",
      "1945-1991: Cold War",
      "1947: Independence and Partition of India",
      "1969: First moon landing",
      "1989-1991: Fall of communism in Eastern Europe and dissolution of the Soviet Union",
      "2001: September 11 attacks",
      "2020: COVID-19 global pandemic",
    ],
  },
};

// Page component for dynamic era routes
export default function EraPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Check if the slug matches any era in our data
  if (!eraData[slug as keyof typeof eraData]) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Era Not Found</h1>
          <p className="text-center mb-6">
            Sorry, we couldn't find information about this historical era.
          </p>
          <div className="text-center">
            <Link
              href="/eras"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              View All Eras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get the era data
  const era = eraData[slug as keyof typeof eraData];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-2 text-center">{era.title}</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">{era.period}</p>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-lg">{era.description}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Key Events</h2>
          <ul className="space-y-2">
            {era.keyEvents.map((event, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mt-2 mr-2"></span>
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Explore This Era</h2>
          <p className="mb-4">
            Dive deeper into the {era.title} through our curated articles,
            biographies of key figures, and detailed timelines.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/eras/${slug}/articles`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Articles
            </Link>
            <Link
              href={`/eras/${slug}/figures`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Key Figures
            </Link>
            <Link
              href={`/eras/${slug}/timeline`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Timeline
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/eras"
            className="inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to All Eras
          </Link>
        </div>
      </div>
    </div>
  );
}
