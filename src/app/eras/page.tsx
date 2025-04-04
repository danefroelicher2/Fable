// src/app/eras/[eraSlug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

// Define our available eras with content
const eras = {
  "early-civilizations": {
    title: "Early Civilizations",
    period: "3000 BCE - 1200 BCE",
    description:
      "The emergence of the first complex societies in Mesopotamia, Egypt, the Indus Valley, and China.",
    content: [
      {
        subheading: "Rise of Urban Centers",
        text: "The first cities arose in Mesopotamia around 3500 BCE, with Uruk becoming one of the world's first major urban centers. These early cities featured specialized labor, monumental architecture, and the earliest writing systems.",
      },
      {
        subheading: "Ancient Egypt",
        text: "Egyptian civilization emerged along the Nile River around 3100 BCE, bringing innovations in mathematics, astronomy, and architecture. The pyramids at Giza, built during the Old Kingdom period, remain among the most impressive structures ever created.",
      },
      {
        subheading: "Indus Valley Civilization",
        text: "Flourishing between 2600-1900 BCE, the Indus Valley Civilization extended across modern-day Pakistan and parts of India. Cities like Harappa and Mohenjo-daro featured sophisticated urban planning, drainage systems, and standardized weights and measures.",
      },
    ],
    imageUrl: "/images/early-civilizations.jpg",
  },
  "rise-of-empires": {
    title: "Rise of Empires",
    period: "1200 BCE - 500 BCE",
    description:
      "The formation of early empires and the widespread use of iron technology.",
    content: [
      {
        subheading: "The Iron Age Revolution",
        text: "The transition to iron technology around 1200 BCE dramatically changed warfare and agriculture. Iron tools and weapons were stronger, more durable, and could be produced more affordably than bronze alternatives.",
      },
      {
        subheading: "Neo-Assyrian Empire",
        text: "The Neo-Assyrian Empire (911-609 BCE) became the first true empire in history, using iron weapons and innovative military tactics to conquer vast territories across the Middle East. Their administrative systems set a template for future empires.",
      },
      {
        subheading: "Persian Innovations",
        text: "The Achaemenid Persian Empire (550-330 BCE) created the largest empire the world had yet seen, stretching from Egypt to India. The Persians pioneered innovations in imperial governance, including a sophisticated road network and postal system.",
      },
    ],
    imageUrl: "/images/rise-of-empires.jpg",
  },
  "classical-empires": {
    title: "Classical Empires",
    period: "500 BCE - 500 CE",
    description:
      "The age of the great classical civilizations of Greece, Rome, Persia, India, and China.",
    content: [
      {
        subheading: "Greek Golden Age",
        text: "Athens in the 5th century BCE witnessed an explosion of cultural and intellectual achievements, including the birth of democracy, philosophy, theater, and major advances in science and architecture.",
      },
      {
        subheading: "Roman Engineering",
        text: "The Roman Empire revolutionized infrastructure with innovations like concrete, aqueducts, roads, and sewage systems. Their architectural achievements included the Colosseum, Pantheon, and thousands of miles of paved roads.",
      },
      {
        subheading: "Han Dynasty China",
        text: "Under the Han Dynasty (206 BCE-220 CE), China expanded its territory, established the Silk Road trade network, and made advances in science and technology including paper-making, the seismograph, and the ship's rudder.",
      },
    ],
    imageUrl: "/images/classical-empires.jpg",
  },
  "rise-of-religion": {
    title: "Rise of Religion",
    period: "300 CE - 800 CE",
    description:
      "The spread of world religions including Christianity, Islam, and Buddhism.",
    content: [
      {
        subheading: "Christianity's Spread",
        text: "After Emperor Constantine's conversion in 312 CE, Christianity transformed from a persecuted sect to the dominant religion of the Roman Empire, fundamentally reshaping European society, politics, and culture.",
      },
      {
        subheading: "Birth of Islam",
        text: "Beginning with Muhammad's revelations in the early 7th century, Islam spread rapidly across the Middle East, North Africa, and parts of Asia, creating one of the world's largest and most advanced civilizations within just a century.",
      },
      {
        subheading: "Buddhism's Influence",
        text: "Buddhism spread from India to East and Southeast Asia, profoundly influencing art, philosophy, and social structures in China, Korea, Japan, and Tibet, while developing distinct regional traditions.",
      },
    ],
    imageUrl: "/images/rise-of-religion.jpg",
  },
  renaissance: {
    title: "Renaissance",
    period: "1400 - 1700 CE",
    description:
      "A period of cultural rebirth and artistic innovation in Europe.",
    content: [
      {
        subheading: "Rebirth of Classical Learning",
        text: "The Renaissance saw the rediscovery and study of ancient Greek and Roman texts, leading to a revival of classical learning that transformed European intellectual life and encouraged critical thinking.",
      },
      {
        subheading: "Artistic Revolution",
        text: "Artists like Leonardo da Vinci, Michelangelo, and Raphael developed revolutionary techniques including linear perspective and realistic human anatomy, creating masterpieces that still define our understanding of artistic brilliance.",
      },
      {
        subheading: "Scientific Advancements",
        text: "The Renaissance witnessed the beginnings of modern science, with figures like Copernicus, Galileo, and Vesalius challenging ancient authorities and developing the experimental method that would transform humanity's understanding of the natural world.",
      },
    ],
    imageUrl: "/images/renaissance.jpg",
  },
  "era-of-revolutions": {
    title: "Era of Revolutions",
    period: "1700 - 1900 CE",
    description:
      "Political and industrial revolutions that transformed society.",
    content: [
      {
        subheading: "American Revolution",
        text: "The American Revolution (1775-1783) established the first modern republic based on Enlightenment principles of liberty and self-government, inspiring revolutionary movements worldwide.",
      },
      {
        subheading: "French Revolution",
        text: "The French Revolution (1789-1799) dismantled the monarchy and feudal system, promoting ideas of liberty, equality, and fraternity that fundamentally altered European political and social systems.",
      },
      {
        subheading: "Industrial Revolution",
        text: "Beginning in Britain around 1760, the Industrial Revolution transformed manufacturing, transportation, and daily life through innovations like steam power, factories, and railroads, creating modern industrial society.",
      },
    ],
    imageUrl: "/images/era-of-revolutions.jpg",
  },
  "common-era": {
    title: "Common Era",
    period: "1900 - Present",
    description:
      "The modern era characterized by world wars, technological advances, and globalization.",
    content: [
      {
        subheading: "World Wars",
        text: "The two World Wars (1914-1918 and 1939-1945) reshaped global politics, ended empires, and established new superpowers, while technological innovations developed for warfare transformed civilian life.",
      },
      {
        subheading: "Digital Revolution",
        text: "Beginning with early computers in the mid-20th century and accelerating with the internet in the 1990s, the Digital Revolution has transformed communication, commerce, entertainment, and virtually every aspect of daily life.",
      },
      {
        subheading: "Globalization",
        text: "Increased economic integration, communication, travel, and cultural exchange have created a more interconnected world, while presenting new challenges in addressing global issues like climate change and inequality.",
      },
    ],
    imageUrl: "/images/common-era.jpg",
  },
};

export default function EraPage({ params }: { params: { eraSlug: string } }) {
  const { eraSlug } = params;

  // Check if the era exists in our data
  if (!eras[eraSlug as keyof typeof eras]) {
    return notFound();
  }

  const era = eras[eraSlug as keyof typeof eras];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{era.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{era.period}</p>

        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <p className="text-lg mb-8">{era.description}</p>

          <div className="mb-8">
            {/* Replace with actual image when available */}
            <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center text-gray-500">
              [Image: {era.title}]
            </div>
          </div>

          <div className="space-y-6">
            {era.content.map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold mb-2">
                  {section.subheading}
                </h2>
                <p className="text-gray-700">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-4">Related Resources</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Key Figures in {era.title}
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Timeline of {era.title}
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Major Events in {era.title}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link href="/eras" className="text-blue-600 hover:text-blue-800">
            ← Back to All Eras
          </Link>
        </div>
      </div>
    </div>
  );
}
