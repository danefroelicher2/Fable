// src/app/world/[slug]/page.tsx
import Link from "next/link";

// Sample data for each world region
const regionData = {
  ancient: {
    title: "Ancient Civilizations",
    period: "3000 BCE - 500 CE",
    description:
      "The ancient world was home to remarkable civilizations that created sophisticated societies, monumental architecture, complex writing systems, and cultural achievements that influenced all subsequent human history.",
    keyEvents: [
      "3500-3000 BCE: Development of writing in Mesopotamia",
      "3100 BCE: Unification of Upper and Lower Egypt",
      "2700-2500 BCE: Construction of the Great Pyramids in Egypt",
      "1900-1600 BCE: Indus Valley Civilization at its peak",
      "1700-1400 BCE: Minoan civilization flourishes on Crete",
      "1200 BCE: Bronze Age collapse",
      "508 BCE: Athenian democracy established",
      "336-323 BCE: Reign of Alexander the Great",
      "221 BCE: Qin Shi Huang unifies China",
      "27 BCE: Roman Republic becomes the Roman Empire under Augustus",
      "476 CE: Fall of the Western Roman Empire",
    ],
    regions: [
      "Mesopotamia",
      "Ancient Egypt",
      "Greece",
      "Rome",
      "Persia",
      "China",
      "India",
      "Maya",
      "Aztec",
      "Inca",
    ],
  },
  europe: {
    title: "European History",
    period: "500 CE - Present",
    description:
      "European history encompasses the social, cultural, political and economic developments that shaped the continent from the fall of the Western Roman Empire to the modern era.",
    keyEvents: [
      "500-1000 CE: Early Middle Ages, migration period",
      "800 CE: Coronation of Charlemagne as Holy Roman Emperor",
      "1066: Norman Conquest of England",
      "1095-1291: Crusades",
      "1347-1351: Black Death pandemic",
      "1400-1600: Renaissance period",
      "1517: Protestant Reformation begins",
      "1618-1648: Thirty Years' War",
      "1789: French Revolution begins",
      "1914-1918: World War I",
      "1939-1945: World War II",
      "1957: Treaty of Rome establishes the European Economic Community",
      "1989-1991: Fall of communism in Eastern Europe",
      "1993: European Union established",
    ],
    regions: [
      "Western Europe",
      "Eastern Europe",
      "Northern Europe",
      "Southern Europe",
      "Central Europe",
      "United Kingdom",
      "France",
      "Germany",
      "Italy",
      "Spain",
      "Russia",
      "Scandinavia",
      "Balkans",
    ],
  },
  asia: {
    title: "Asian History",
    period: "3000 BCE - Present",
    description:
      "Asian history spans multiple civilizations across the continent's vast geographic area, from ancient times through colonization, modernization, and beyond.",
    keyEvents: [
      "2200-1600 BCE: Xia Dynasty, the first Chinese dynasty",
      "1500-500 BCE: Vedic Period in India",
      "563 BCE: Birth of Buddha",
      "221 BCE: Unification of China under Qin Dynasty",
      "320-550 CE: Gupta Empire in India",
      "618-907 CE: Tang Dynasty in China",
      "794-1185: Heian Period in Japan",
      "1206-1368: Mongol Empire",
      "1368-1644: Ming Dynasty in China",
      "1600s-1800s: European colonization in Asia",
      "1853: Opening of Japan by Commodore Perry",
      "1947: Independence of India and Pakistan",
      "1949: Communist Revolution in China",
      "1950-1953: Korean War",
      "1955-1975: Vietnam War",
      "1978: Economic reforms in China",
    ],
    regions: [
      "East Asia",
      "South Asia",
      "Southeast Asia",
      "Central Asia",
      "China",
      "Japan",
      "Korea",
      "India",
      "Vietnam",
      "Thailand",
      "Indonesia",
      "Philippines",
      "Malaysia",
      "Mongolia",
    ],
  },
  africa: {
    title: "African History",
    period: "3000 BCE - Present",
    description:
      "African history encompasses the rich diversity of the continent's peoples, cultures, and civilizations, from ancient Egypt to contemporary times.",
    keyEvents: [
      "3100 BCE: Unification of Upper and Lower Egypt",
      "1000 BCE-350 CE: Kingdom of Kush",
      "300-1200 CE: Ghana Empire in West Africa",
      "1235-1600: Mali Empire, including reign of Mansa Musa",
      "1270-1974: Ethiopian Empire (Solomonic Dynasty)",
      "1400s-1500s: Height of Great Zimbabwe",
      "1652: Dutch East India Company establishes Cape Colony",
      "1700s-1800s: Height of Atlantic slave trade",
      "1884-1885: Berlin Conference and the 'Scramble for Africa'",
      "1889-1914: European colonization of most of Africa",
      "1950s-1990s: African independence movements",
      "1994: End of apartheid in South Africa",
    ],
    regions: [
      "North Africa",
      "West Africa",
      "East Africa",
      "Central Africa",
      "Southern Africa",
      "Egypt",
      "Ethiopia",
      "Nigeria",
      "South Africa",
      "Kenya",
      "Ghana",
      "Mali",
      "Zimbabwe",
      "Congo",
    ],
  },
  "latin-america": {
    title: "Latin American History",
    period: "1500 CE - Present",
    description:
      "Latin American history encompasses the colonial period, independence movements, and subsequent development of nations in Central and South America.",
    keyEvents: [
      "1492: Columbus arrives in the Americas",
      "1519-1521: Spanish conquest of the Aztec Empire",
      "1532-1533: Spanish conquest of the Inca Empire",
      "1600s-1700s: Colonial period and plantation economy",
      "1791-1804: Haitian Revolution",
      "1810-1825: Most Spanish colonies gain independence",
      "1822: Brazilian independence",
      "1846-1848: Mexican-American War",
      "1879-1883: War of the Pacific",
      "1910-1920: Mexican Revolution",
      "1959: Cuban Revolution",
      "1970s-1980s: Military dictatorships in South America",
      "1980s-1990s: Return to democracy in many countries",
    ],
    regions: [
      "Mexico",
      "Central America",
      "Caribbean",
      "South America",
      "Brazil",
      "Argentina",
      "Chile",
      "Peru",
      "Colombia",
      "Venezuela",
      "Cuba",
      "Haiti",
      "Dominican Republic",
    ],
  },
  "middle-east": {
    title: "Middle Eastern History",
    period: "3000 BCE - Present",
    description:
      "The Middle East has been the cradle of civilization, birthplace of major religions, and center of empires from ancient times to the present day.",
    keyEvents: [
      "3500-3000 BCE: Development of writing in Mesopotamia",
      "550-330 BCE: Persian Empire (Achaemenid Dynasty)",
      "632-661 CE: Rise of Islam and the Rashidun Caliphate",
      "661-750: Umayyad Caliphate",
      "750-1258: Abbasid Caliphate",
      "1096-1291: Crusades",
      "1299-1922: Ottoman Empire",
      "1516-1517: Ottoman conquest of the Mamluk Sultanate",
      "1798: Napoleon's campaign in Egypt",
      "1869: Suez Canal opens",
      "1916: Sykes-Picot Agreement",
      "1948: Establishment of the State of Israel",
      "1979: Iranian Revolution",
      "1990-1991: Gulf War",
      "2003: Iraq War",
      "2010-2012: Arab Spring",
    ],
    regions: [
      "Mesopotamia",
      "Levant",
      "Arabian Peninsula",
      "Persia/Iran",
      "Turkey",
      "Egypt",
      "Syria",
      "Iraq",
      "Saudi Arabia",
      "Israel/Palestine",
      "Jordan",
      "Lebanon",
      "Yemen",
      "United Arab Emirates",
    ],
  },
  ww1: {
    title: "World War I",
    period: "1914 - 1918",
    description:
      "World War I was a global conflict originating in Europe that transformed warfare, redrew national boundaries, and set the stage for future conflicts.",
    keyEvents: [
      "June 28, 1914: Assassination of Archduke Franz Ferdinand",
      "July-August 1914: Declarations of war and mobilization",
      "September 1914: First Battle of the Marne",
      "1915: Italy enters the war; Ottoman genocide of Armenians begins",
      "1916: Battle of Verdun; Battle of the Somme",
      "April 1917: United States enters the war",
      "March 1918: Treaty of Brest-Litovsk",
      "November 11, 1918: Armistice signed",
      "1919-1920: Paris Peace Conference and Treaty of Versailles",
    ],
    fronts: [
      "Western Front",
      "Eastern Front",
      "Italian Front",
      "Balkan Front",
      "Middle Eastern Front",
      "African Front",
      "Naval Warfare",
      "Air Warfare",
    ],
  },
  ww2: {
    title: "World War II",
    period: "1939 - 1945",
    description:
      "World War II was the deadliest global conflict in history, involving more than 30 countries and resulting in 70-85 million fatalities.",
    keyEvents: [
      "September 1, 1939: Germany invades Poland",
      "1940: Fall of France; Battle of Britain",
      "June 1941: Germany invades the Soviet Union",
      "December 7, 1941: Attack on Pearl Harbor; US enters the war",
      "1942: Battle of Midway; Battle of Stalingrad begins",
      "1943: Allied invasion of Italy; Tehran Conference",
      "June 6, 1944: D-Day landings in Normandy",
      "August 1945: Atomic bombings of Hiroshima and Nagasaki",
      "September 2, 1945: Japan surrenders, ending the war",
    ],
    theaters: [
      "European Theater",
      "Pacific Theater",
      "Eastern Front",
      "North African Campaign",
      "Italian Campaign",
      "Western Front",
      "China-Burma-India Theater",
      "Atlantic Battle",
    ],
  },
  "cold-war": {
    title: "Cold War",
    period: "1947 - 1991",
    description:
      "The Cold War was a period of geopolitical tension between the United States and the Soviet Union and their respective allies.",
    keyEvents: [
      "1947: Truman Doctrine announced; Marshall Plan proposed",
      "1948-1949: Berlin Blockade",
      "1949: NATO established; Soviet Union tests nuclear weapon",
      "1950-1953: Korean War",
      "1956: Hungarian Revolution; Suez Crisis",
      "1961: Berlin Wall constructed; Bay of Pigs Invasion",
      "1962: Cuban Missile Crisis",
      "1965-1973: Vietnam War escalation and US involvement",
      "1979-1989: Soviet-Afghan War",
      "1985-1991: Gorbachev's reforms (Glasnost and Perestroika)",
      "1989: Fall of the Berlin Wall",
      "1991: Dissolution of the Soviet Union",
    ],
    aspects: [
      "Ideological Conflict",
      "Nuclear Arms Race",
      "Space Race",
      "Proxy Wars",
      "Espionage",
      "Propaganda",
      "Economic Competition",
      "Cultural Cold War",
      "Decolonization",
      "Non-Aligned Movement",
    ],
  },
};

export default function WorldRegionPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Check if the slug matches any region in our data
  if (!regionData[slug as keyof typeof regionData]) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Region Not Found
          </h1>
          <p className="text-center mb-6">
            Sorry, we couldn't find information about this historical region or
            event.
          </p>
          <div className="text-center">
            <Link
              href="/world"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Explore World History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get the region data
  const region = regionData[slug as keyof typeof regionData];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-2 text-center">{region.title}</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">
          {region.period}
        </p>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-lg">{region.description}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Key Events</h2>
          <ul className="space-y-2">
            {region.keyEvents.map((event, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mt-2 mr-2"></span>
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Explore {region.title}</h2>
          <p className="mb-4">
            Dive deeper into {region.title} through our curated articles,
            biographies of key figures, and detailed timelines.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/world/${slug}/articles`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Articles
            </Link>
            <Link
              href={`/world/${slug}/figures`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Key Figures
            </Link>
            <Link
              href={`/world/${slug}/timeline`}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              Timeline
            </Link>
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
