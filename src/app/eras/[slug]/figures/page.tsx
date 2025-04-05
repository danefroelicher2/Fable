// src/app/eras/[slug]/figures/page.tsx
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

// Sample figures data - in a real app you would fetch this from a database
const getFiguresForEra = (eraSlug: string) => {
  // Different key figures for each era
  const figuresByEra: Record<
    string,
    Array<{
      id: string;
      name: string;
      role: string;
      years: string;
      description: string;
    }>
  > = {
    "early-civilizations": [
      {
        id: "hammurabi",
        name: "Hammurabi",
        role: "King of Babylon",
        years: "c. 1810 BCE – c. 1750 BCE",
        description:
          "Sixth king of the First Babylonian dynasty, best known for the Code of Hammurabi, one of the earliest and most complete legal codes from antiquity.",
      },
      {
        id: "hatshepsut",
        name: "Hatshepsut",
        role: "Egyptian Pharaoh",
        years: "c. 1507 BCE – c. 1458 BCE",
        description:
          "One of the most successful pharaohs of ancient Egypt. She established important trade networks and commissioned impressive building projects.",
      },
      {
        id: "gilgamesh",
        name: "Gilgamesh",
        role: "King of Uruk",
        years: "c. 2800 BCE – c. 2500 BCE",
        description:
          "Possibly based on a historical figure, Gilgamesh is the main character in the Epic of Gilgamesh, one of the earliest surviving works of literature.",
      },
      {
        id: "imhotep",
        name: "Imhotep",
        role: "Architect, Physician, and Advisor",
        years: "c. 2650 BCE – c. 2600 BCE",
        description:
          "Chief architect to Pharaoh Djoser and designer of the Step Pyramid. Later deified as a god of medicine and healing.",
      },
    ],
    "rise-of-empires": [
      {
        id: "cyrus-the-great",
        name: "Cyrus the Great",
        role: "Founder of the Achaemenid Empire",
        years: "c. 600 BCE – 530 BCE",
        description:
          "Founder of the first Persian Empire, known for his respect for the customs and religions of the lands he conquered.",
      },
      {
        id: "nebuchadnezzar-ii",
        name: "Nebuchadnezzar II",
        role: "King of Babylon",
        years: "c. 634 BCE – 562 BCE",
        description:
          "Neo-Babylonian king who constructed the Hanging Gardens of Babylon and conquered Jerusalem.",
      },
      {
        id: "romulus",
        name: "Romulus",
        role: "Founder of Rome",
        years: "c. 771 BCE – c. 717 BCE",
        description:
          "Legendary founder and first king of Rome, whose life is mixed with mythology but represents the beginning of Roman civilization.",
      },
    ],
    "classical-empires": [
      {
        id: "alexander-the-great",
        name: "Alexander the Great",
        role: "King of Macedonia and Conqueror",
        years: "356 BCE – 323 BCE",
        description:
          "Created one of the largest empires in ancient history, spreading Greek culture across three continents.",
      },
      {
        id: "qin-shi-huang",
        name: "Qin Shi Huang",
        role: "First Emperor of Unified China",
        years: "259 BCE – 210 BCE",
        description:
          "Unified China, standardized writing, currency, and measurements, and began construction of the Great Wall.",
      },
      {
        id: "augustus",
        name: "Augustus",
        role: "First Roman Emperor",
        years: "63 BCE – 14 CE",
        description:
          "Transformed Rome from a republic into an empire and presided over an era of relative peace and prosperity known as the Pax Romana.",
      },
      {
        id: "ashoka",
        name: "Ashoka the Great",
        role: "Emperor of the Maurya Dynasty",
        years: "304 BCE – 232 BCE",
        description:
          "After witnessing the devastation of his conquest of Kalinga, embraced Buddhism and ruled through principles of non-violence and tolerance.",
      },
    ],
    "rise-of-religion": [
      {
        id: "muhammad",
        name: "Muhammad",
        role: "Prophet of Islam",
        years: "570 CE – 632 CE",
        description:
          "Founder of Islam, unified Arabia under a single religious polity under the first caliphate.",
      },
      {
        id: "constantine",
        name: "Constantine the Great",
        role: "Roman Emperor",
        years: "272 CE – 337 CE",
        description:
          "First Roman Emperor to convert to Christianity, issued the Edict of Milan legalizing Christian worship.",
      },
      {
        id: "justinian",
        name: "Justinian I",
        role: "Byzantine Emperor",
        years: "482 CE – 565 CE",
        description:
          "Sought to revive the Roman Empire, codified Roman law, and built the Hagia Sophia.",
      },
    ],
    renaissance: [
      {
        id: "leonardo",
        name: "Leonardo da Vinci",
        role: "Artist, Scientist, and Inventor",
        years: "1452 – 1519",
        description:
          "Renaissance polymath whose works included the Mona Lisa and The Last Supper, also made significant contributions to science and engineering.",
      },
      {
        id: "elizabeth-i",
        name: "Elizabeth I",
        role: "Queen of England",
        years: "1533 – 1603",
        description:
          "Her reign, known as the Elizabethan Era, was marked by English exploration, a flourishing of the arts, and religious moderation.",
      },
      {
        id: "martin-luther",
        name: "Martin Luther",
        role: "Theologian and Religious Reformer",
        years: "1483 – 1546",
        description:
          "Initiated the Protestant Reformation with his Ninety-Five Theses, challenging the authority of the Catholic Church.",
      },
    ],
    "era-of-revolutions": [
      {
        id: "napoleon",
        name: "Napoleon Bonaparte",
        role: "French Military Leader and Emperor",
        years: "1769 – 1821",
        description:
          "Rose to prominence during the French Revolution, established the First French Empire, and implemented the Napoleonic Code.",
      },
      {
        id: "washington",
        name: "George Washington",
        role: "Revolutionary Leader and First U.S. President",
        years: "1732 – 1799",
        description:
          "Led the Continental Army to victory in the American Revolutionary War and established many precedents for the American presidency.",
      },
      {
        id: "marx",
        name: "Karl Marx",
        role: "Philosopher, Economist, and Revolutionary",
        years: "1818 – 1883",
        description:
          "Developed the theory of scientific socialism and co-authored The Communist Manifesto, profoundly influencing political thought.",
      },
      {
        id: "nightingale",
        name: "Florence Nightingale",
        role: "Founder of Modern Nursing",
        years: "1820 – 1910",
        description:
          "Pioneered modern nursing practices during the Crimean War and established the first secular nursing school in the world.",
      },
    ],
    "common-era": [
      {
        id: "einstein",
        name: "Albert Einstein",
        role: "Theoretical Physicist",
        years: "1879 – 1955",
        description:
          "Developed the theory of relativity and made significant contributions to the development of quantum mechanics.",
      },
      {
        id: "gandhi",
        name: "Mahatma Gandhi",
        role: "Political and Spiritual Leader",
        years: "1869 – 1948",
        description:
          "Led India to independence through nonviolent civil disobedience, inspiring civil rights movements worldwide.",
      },
      {
        id: "mandela",
        name: "Nelson Mandela",
        role: "Anti-Apartheid Revolutionary and President of South Africa",
        years: "1918 – 2013",
        description:
          "Fought against apartheid, spent 27 years in prison, and became South Africa's first Black president.",
      },
      {
        id: "curie",
        name: "Marie Curie",
        role: "Physicist and Chemist",
        years: "1867 – 1934",
        description:
          "Pioneer in the field of radioactivity, first person to win Nobel Prizes in two different scientific fields.",
      },
    ],
  };

  return figuresByEra[eraSlug] || [];
};

export default function EraFiguresPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const eraTitle = eraTitles[slug as keyof typeof eraTitles] || "Unknown Era";
  const figures = getFiguresForEra(slug);

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
            <span>Key Figures</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Key Figures of the {eraTitle}
          </h1>
          <p className="text-gray-600">
            Learn about the influential individuals who shaped the {eraTitle}{" "}
            era through their leadership, innovations, and cultural
            contributions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {figures.map((figure) => (
            <div
              key={figure.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold mb-1">
                <Link
                  href={`/eras/${slug}/figures/${figure.id}`}
                  className="text-gray-800 hover:text-blue-600"
                >
                  {figure.name}
                </Link>
              </h2>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{figure.role}</span>
                <span className="mx-2">•</span>
                <span>{figure.years}</span>
              </div>
              <p className="text-gray-700 mb-3">{figure.description}</p>
              <Link
                href={`/eras/${slug}/figures/${figure.id}`}
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                Read full biography
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
          ))}
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            Explore More Historical Figures
          </h2>
          <p className="mb-4">
            Our database contains thousands of biographies from throughout
            history. Use the filters below to discover more notable individuals
            from this era.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full p-2 border rounded">
                <option>All Categories</option>
                <option>Political Leaders</option>
                <option>Military Figures</option>
                <option>Scientists & Inventors</option>
                <option>Artists & Writers</option>
                <option>Religious Leaders</option>
                <option>Philosophers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select className="w-full p-2 border rounded">
                <option>All Regions</option>
                <option>Europe</option>
                <option>Asia</option>
                <option>Africa</option>
                <option>Americas</option>
                <option>Middle East</option>
                <option>Oceania</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select className="w-full p-2 border rounded">
                <option>Relevance</option>
                <option>Alphabetical (A-Z)</option>
                <option>Chronological (Earliest-Latest)</option>
                <option>Chronological (Latest-Earliest)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
