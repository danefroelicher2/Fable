import Link from "next/link";
import ThisDayInHistory from "@/components/ThisDayInHistory";

// Mock data for testing - featured posts
const featuredPosts = [
  {
    id: "1",
    title: "The Fall of Rome: Myths and Realities",
    slug: "fall-of-rome-myths-realities",
    date: "March 15, 2024",
    excerpt:
      "Exploring the complex factors that led to the decline of the Roman Empire and separating historical fact from fiction.",
  },
  {
    id: "2",
    title: "Medieval Medicine: More Advanced Than You Think",
    slug: "medieval-medicine-advancements",
    date: "March 10, 2024",
    excerpt:
      "Challenging common misconceptions about medical practices in the Middle Ages.",
  },
  {
    id: "3",
    title: "The Real Story Behind the Cuban Missile Crisis",
    slug: "cuban-missile-crisis-real-story",
    date: "March 5, 2024",
    excerpt:
      "Declassified documents reveal new insights into how close the world came to nuclear war.",
  },
];

// Historical eras for navigation
const historicalEras = [
  { name: "Ancient History", url: "/blog/category/ancient-history" },
  { name: "Medieval Period", url: "/blog/category/medieval-period" },
  { name: "Renaissance", url: "/blog/category/renaissance" },
  { name: "Early Modern Period", url: "/blog/category/early-modern-period" },
  { name: "Industrial Age", url: "/blog/category/industrial-age" },
  { name: "20th Century", url: "/blog/category/20th-century" },
  { name: "World Wars", url: "/blog/category/world-wars" },
  { name: "Cold War Era", url: "/blog/category/cold-war-era" },
  { name: "Modern History", url: "/blog/category/modern-history" },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 px-4 mb-12 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Uncovering the Past, One Story at a Time
          </h1>
          <p className="text-xl mb-8">
            Explore fascinating historical events, figures, and eras through
            in-depth articles, timelines, and analyses.
          </p>
          <Link
            href="/blog"
            className="inline-block bg-white text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-blue-100 transition-colors"
          >
            Explore Articles
          </Link>
        </div>
      </section>

      {/* This Day in History Widget */}
      <ThisDayInHistory />

      {/* Featured Posts */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Articles</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            View All Articles
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden p-4"
            >
              <div className="h-48 bg-slate-200 mb-4 rounded overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  [Featured Image: {post.title}]
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-slate-800 hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-slate-600 text-sm mb-2">{post.date}</p>
                <p className="text-slate-700">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Eras */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Explore Historical Eras</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {historicalEras.map((era) => (
            <Link
              key={era.name}
              href={era.url}
              className="bg-white p-4 rounded-lg shadow text-center hover:bg-blue-50 hover:shadow-md transition-all"
            >
              {era.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-slate-100 p-8 rounded-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6">
            Subscribe to our newsletter to receive the latest articles and
            historical insights.
          </p>
          <form className="flex flex-col md:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
