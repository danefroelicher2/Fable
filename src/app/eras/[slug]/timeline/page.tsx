// src/app/eras/[slug]/timeline/page.tsx
import Link from "next/link";

// Sample era titles for reference
const eraTitles = {
  "early-civilizations": "Early Civilizations",
  "rise-of-empires": "Rise of Empires",
  "classical-empires": "Classical Empires",
  "rise-of-religion": "Rise of Religion",
  renaissance: "Renaissance",
  "era-of-revolutions": "Era of Revolutions",
  "common-era": "Common Era",
};

// Sample timeline data for each era
const getTimelineForEra = (eraSlug: string) => {
  // Different timelines for each era
  const timelinesByEra: Record<
    string,
    Array<{
      year: string;
      event: string;
      importance: "high" | "medium" | "low";
    }>
  > = {
    "early-civilizations": [
      {
        year: "3500 BCE",
        event: "Development of writing in Mesopotamia",
        importance: "high",
      },
      {
        year: "3100 BCE",
        event: "Unification of Upper and Lower Egypt under King Menes/Narmer",
        importance: "high",
      },
      {
        year: "3000 BCE",
        event: "Beginning of the Bronze Age in the Near East",
        importance: "medium",
      },
      {
        year: "2700 BCE",
        event: "Construction of the first Egyptian pyramids",
        importance: "high",
      },
      {
        year: "2600 BCE",
        event: "Construction of Stonehenge begins",
        importance: "medium",
      },
      {
        year: "2500 BCE",
        event: "Peak of the Indus Valley Civilization",
        importance: "high",
      },
      {
        year: "2300 BCE",
        event: "Sargon of Akkad creates the first empire in Mesopotamia",
        importance: "high",
      },
      {
        year: "2200 BCE",
        event: "Collapse of the Akkadian Empire due to climate change",
        importance: "medium",
      },
      {
        year: "2000 BCE",
        event: "Rise of Babylonia under Hammurabi",
        importance: "high",
      },
      {
        year: "1800 BCE",
        event: "The Code of Hammurabi is composed",
        importance: "high",
      },
      {
        year: "1600 BCE",
        event: "Beginning of the Shang Dynasty in China",
        importance: "high",
      },
      {
        year: "1500 BCE",
        event: "Height of Minoan civilization on Crete",
        importance: "medium",
      },
      {
        year: "1200 BCE",
        event: "Bronze Age collapse begins in the Eastern Mediterranean",
        importance: "high",
      },
    ],
    "rise-of-empires": [
      {
        year: "1200 BCE",
        event: "Bronze Age collapse in the Eastern Mediterranean",
        importance: "high",
      },
      {
        year: "1046 BCE",
        event: "Zhou Dynasty replaces Shang Dynasty in China",
        importance: "high",
      },
      {
        year: "1000 BCE",
        event: "Kingdom of Israel established under King David",
        importance: "high",
      },
      {
        year: "814 BCE",
        event: "Traditional founding date of Carthage by Phoenicians",
        importance: "medium",
      },
      {
        year: "753 BCE",
        event: "Traditional founding date of Rome",
        importance: "high",
      },
      {
        year: "722 BCE",
        event: "Fall of Israel to Assyrian Empire",
        importance: "medium",
      },
      {
        year: "671 BCE",
        event: "Assyrians conquer Egypt",
        importance: "medium",
      },
      {
        year: "612 BCE",
        event: "Fall of Nineveh, capital of Assyria",
        importance: "high",
      },
      {
        year: "597 BCE",
        event: "Babylonian captivity of the Jews begins",
        importance: "medium",
      },
      {
        year: "550 BCE",
        event: "Cyrus the Great founds the Persian Empire",
        importance: "high",
      },
      {
        year: "539 BCE",
        event: "Cyrus conquers Babylon and releases the Jews",
        importance: "medium",
      },
      {
        year: "509 BCE",
        event: "Roman Republic established",
        importance: "high",
      },
      {
        year: "500 BCE",
        event: "Beginning of Classical Age in Greece",
        importance: "high",
      },
    ],
    "classical-empires": [
      {
        year: "500 BCE",
        event: "Beginning of Classical Age in Greece",
        importance: "high",
      },
      { year: "490-479 BCE", event: "Greco-Persian Wars", importance: "high" },
      {
        year: "449 BCE",
        event: "Athenian Golden Age under Pericles begins",
        importance: "high",
      },
      {
        year: "336-323 BCE",
        event: "Reign of Alexander the Great",
        importance: "high",
      },
      { year: "323-30 BCE", event: "Hellenistic Period", importance: "medium" },
      {
        year: "264-146 BCE",
        event: "Punic Wars between Rome and Carthage",
        importance: "high",
      },
      {
        year: "221 BCE",
        event: "Qin Shi Huang unifies China, becoming the first emperor",
        importance: "high",
      },
      {
        year: "202 BCE",
        event: "Han Dynasty established in China",
        importance: "high",
      },
      {
        year: "44 BCE",
        event: "Assassination of Julius Caesar",
        importance: "high",
      },
      {
        year: "27 BCE",
        event: "Augustus becomes first Roman Emperor",
        importance: "high",
      },
      {
        year: "1-100 CE",
        event: "Roman Empire reaches its greatest extent",
        importance: "high",
      },
      {
        year: "220 CE",
        event:
          "End of Han Dynasty in China, beginning of Three Kingdoms period",
        importance: "medium",
      },
      {
        year: "235-284 CE",
        event: "Crisis of the Third Century in Roman Empire",
        importance: "medium",
      },
      {
        year: "313 CE",
        event: "Edict of Milan legalizes Christianity in Roman Empire",
        importance: "high",
      },
      {
        year: "330 CE",
        event: "Constantinople becomes capital of Roman Empire",
        importance: "high",
      },
      {
        year: "395 CE",
        event:
          "Roman Empire permanently divided into Eastern and Western halves",
        importance: "high",
      },
      {
        year: "476 CE",
        event: "Fall of Western Roman Empire",
        importance: "high",
      },
    ],
    "rise-of-religion": [
      {
        year: "313 CE",
        event: "Edict of Milan legalizes Christianity in Roman Empire",
        importance: "high",
      },
      {
        year: "380 CE",
        event: "Christianity becomes official religion of Roman Empire",
        importance: "high",
      },
      {
        year: "431 CE",
        event: "Council of Ephesus defines Christian doctrine",
        importance: "medium",
      },
      {
        year: "476 CE",
        event: "Fall of Western Roman Empire",
        importance: "high",
      },
      {
        year: "527-565 CE",
        event: "Reign of Justinian I in Byzantine Empire",
        importance: "high",
      },
      {
        year: "570-632 CE",
        event: "Life of Muhammad, founder of Islam",
        importance: "high",
      },
      {
        year: "622 CE",
        event:
          "Muhammad's Hijra to Medina, marking the beginning of the Islamic calendar",
        importance: "high",
      },
      {
        year: "632-661 CE",
        event: "The Rashidun Caliphate and early Islamic conquests",
        importance: "high",
      },
      { year: "661-750 CE", event: "Umayyad Caliphate", importance: "medium" },
      {
        year: "711 CE",
        event: "Muslims conquer Iberian Peninsula",
        importance: "medium",
      },
      { year: "750-1258 CE", event: "Abbasid Caliphate", importance: "high" },
      {
        year: "800 CE",
        event: "Coronation of Charlemagne as Holy Roman Emperor",
        importance: "high",
      },
    ],
    renaissance: [
      {
        year: "1337-1453",
        event: "Hundred Years' War between England and France",
        importance: "medium",
      },
      {
        year: "1347-1351",
        event: "Black Death pandemic in Europe",
        importance: "high",
      },
      {
        year: "1378-1417",
        event: "Western Schism in the Catholic Church",
        importance: "medium",
      },
      {
        year: "1400-1500",
        event: "Italian Renaissance flourishes",
        importance: "high",
      },
      {
        year: "1439",
        event: "Gutenberg develops the printing press",
        importance: "high",
      },
      {
        year: "1453",
        event: "Fall of Constantinople to the Ottoman Turks",
        importance: "high",
      },
      {
        year: "1455-1485",
        event: "Wars of the Roses in England",
        importance: "medium",
      },
      {
        year: "1492",
        event: "Columbus reaches the Americas; Reconquista completed in Spain",
        importance: "high",
      },
      {
        year: "1498",
        event: "Vasco da Gama reaches India",
        importance: "high",
      },
      {
        year: "1517",
        event:
          "Martin Luther posts the 95 Theses, beginning the Protestant Reformation",
        importance: "high",
      },
      {
        year: "1519-1522",
        event: "Magellan's expedition circumnavigates the globe",
        importance: "high",
      },
      {
        year: "1543",
        event: "Copernicus publishes heliocentric theory",
        importance: "high",
      },
      {
        year: "1545-1563",
        event: "Council of Trent and Counter-Reformation",
        importance: "high",
      },
      {
        year: "1558-1603",
        event: "Reign of Elizabeth I in England",
        importance: "high",
      },
      { year: "1618-1648", event: "Thirty Years' War", importance: "high" },
      { year: "1642-1651", event: "English Civil War", importance: "medium" },
      {
        year: "1687",
        event: "Newton publishes Principia Mathematica",
        importance: "high",
      },
    ],
    "era-of-revolutions": [
      {
        year: "1688-1689",
        event: "Glorious Revolution in England",
        importance: "medium",
      },
      { year: "1756-1763", event: "Seven Years' War", importance: "medium" },
      {
        year: "1776",
        event: "American Declaration of Independence",
        importance: "high",
      },
      {
        year: "1789",
        event: "Beginning of the French Revolution",
        importance: "high",
      },
      {
        year: "1793-1794",
        event: "Reign of Terror in France",
        importance: "medium",
      },
      { year: "1799-1815", event: "Napoleonic Era", importance: "high" },
      {
        year: "1804",
        event: "Haitian independence, first Black republic",
        importance: "high",
      },
      {
        year: "1815",
        event: "Congress of Vienna redraws European map",
        importance: "high",
      },
      {
        year: "1830s-1840s",
        event: "Industrial Revolution spreads across Europe",
        importance: "high",
      },
      { year: "1848", event: "Revolutions across Europe", importance: "high" },
      { year: "1861-1865", event: "American Civil War", importance: "high" },
      { year: "1867", event: "Canadian Confederation", importance: "medium" },
      { year: "1868", event: "Meiji Restoration in Japan", importance: "high" },
      { year: "1871", event: "Unification of Germany", importance: "high" },
      {
        year: "1885-1914",
        event: "New Imperialism and the Scramble for Africa",
        importance: "high",
      },
      { year: "1898", event: "Spanish-American War", importance: "medium" },
    ],
    "common-era": [
      { year: "1914-1918", event: "World War I", importance: "high" },
      { year: "1917", event: "Russian Revolution", importance: "high" },
      { year: "1918-1919", event: "Spanish Flu pandemic", importance: "high" },
      { year: "1929-1939", event: "Great Depression", importance: "high" },
      { year: "1939-1945", event: "World War II", importance: "high" },
      {
        year: "1945",
        event:
          "United Nations founded; Atomic bombs dropped on Hiroshima and Nagasaki",
        importance: "high",
      },
      {
        year: "1945-1991",
        event: "Cold War between the United States and Soviet Union",
        importance: "high",
      },
      {
        year: "1947",
        event: "Independence and Partition of India",
        importance: "high",
      },
      {
        year: "1948",
        event: "State of Israel established",
        importance: "high",
      },
      {
        year: "1949",
        event: "People's Republic of China established",
        importance: "high",
      },
      { year: "1950-1953", event: "Korean War", importance: "medium" },
      { year: "1955-1975", event: "Vietnam War", importance: "high" },
      {
        year: "1957",
        event: "Sputnik 1 launched, beginning the Space Age",
        importance: "high",
      },
      { year: "1961", event: "Berlin Wall constructed", importance: "medium" },
      { year: "1962", event: "Cuban Missile Crisis", importance: "high" },
      { year: "1969", event: "First Moon landing", importance: "high" },
      { year: "1989", event: "Fall of the Berlin Wall", importance: "high" },
      {
        year: "1991",
        event: "Dissolution of the Soviet Union",
        importance: "high",
      },
      { year: "2001", event: "September 11 attacks", importance: "high" },
      {
        year: "2007-2008",
        event: "Global Financial Crisis",
        importance: "high",
      },
      {
        year: "2019-2023",
        event: "COVID-19 global pandemic",
        importance: "high",
      },
    ],
  };

  return timelinesByEra[eraSlug] || [];
};

export default function EraTimelinePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const eraTitle = eraTitles[slug as keyof typeof eraTitles] || "Unknown Era";
  const timelineEvents = getTimelineForEra(slug);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center text-sm mb-2">
            <Link href="/eras" className="text-blue-600 hover:text-blue-800">
              Eras
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/eras/${slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {eraTitle}
            </Link>
            <span className="mx-2">›</span>
            <span>Timeline</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{eraTitle}: Timeline</h1>
          <p className="text-gray-600">
            A chronological overview of key events that shaped the {eraTitle}{" "}
            era.
          </p>
        </header>

        <div className="relative mb-12">
          {/* Vertical timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>

          {/* Timeline events */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`relative flex ${
                  index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                } items-center md:justify-center`}
              >
                {/* Date marker */}
                <div className="absolute md:static z-10 left-0 md:left-auto md:w-1/2 md:px-8 flex md:justify-end">
                  <div
                    className={`px-4 py-2 ${
                      event.importance === "high"
                        ? "bg-blue-600 text-white"
                        : event.importance === "medium"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    } rounded-lg font-bold`}
                  >
                    {event.year}
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 z-10 border-2 border-white"></div>

                {/* Event description */}
                <div className="ml-12 md:ml-0 md:w-1/2 md:px-8 bg-white p-4 rounded-lg shadow-md">
                  <p className="text-gray-800">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Interactive Timeline Tools</h2>
          <p className="mb-4">
            Explore our full suite of interactive timeline tools to better
            understand the relationships between events and their historical
            significance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/eras/${slug}/interactive-timeline`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-500 hover:text-white hover:shadow-md transition-all"
            >
              Interactive Timeline Explorer
            </Link>
            <Link
              href={`/eras/${slug}/map-timeline`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-500 hover:text-white hover:shadow-md transition-all"
            >
              Map-Based Timeline View
            </Link>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline View Options
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                All Events
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                Political
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                Military
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                Cultural
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                Scientific
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                Religious
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
