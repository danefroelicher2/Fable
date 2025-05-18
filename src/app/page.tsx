// src/app/page.tsx
import Link from "next/link";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import FanArticles from "@/components/FanArticles";
import Image from "next/image";

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
      {/* Hero Section - Matching dragon's background more precisely */}
      <div className="relative overflow-hidden bg-[#f8f7f2] rounded-lg mb-12 border border-[#eae9e4]">
        {/* Very subtle texture */}
        <div
          className="absolute inset-0 opacity-5 bg-repeat"
          style={{
            backgroundImage:
              "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgcAAABkklEQVR4nJXTiZaDIAwE0EmBEFagCNj//86AolZbjnMqr0l2JgFZVY0xKi/v+/6IOGecc9baBoe01o7jcTfHrXZZFuAdnsfD9OdZiVJKkTWHcj8u5ZrVelIrmexRRYn5TaJQpH9brchXVKtdO2R7rbYQ2Z+kWl1Ny/J68Flr7TxniwLeB0e1wundQFjnlBoTOegdxGq1+XiNQx4uJx51zZ1EnsT1ujhELW7OS7icrLWO291ygbZtw2mt9ZSY1Fzj4fwCB5WrP5Uk+dmRrxMRbStF1OtEMtpWdl498D8JrTY/qXzVHvKLRGSWbFCvvWzkDxJRx9PlfugheZK9wyPw2F9HxIaJ5K4zJTKCbCNP4nZNUmQn38e4NcldZ0qEiO5+dzV5kNzIa3BPMpFcyCsxX0leZGpkWCMbYh8k/0AkYJtPA4+pDb6QQw8Ri5sy5aLcnDHHAmVC5FBW1Q5BTjLV0iiK/KJDqR6Fofq4MqikiFGnxYVUZXk5l4QYKXXKUTnRr4MQIxMRJw4xUnx040014Nq4MILgwgAAAABJRU5ErkJggg==')",
          }}
        ></div>

        <div className="relative flex flex-col md:flex-row items-center py-16 px-6 md:px-12">
          {/* Left side content */}
          <div className="w-full md:w-1/2 text-gray-900 z-10 mb-10 md:mb-0">
            <h2 className="text-2xl font-semibold tracking-wide mb-3">
              WELCOME TO THE PAST
            </h2>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Historians and
              <br />
              Time-travelers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-xl">
              Join a community of history enthusiasts exploring the fascinating
              stories of our shared past.
            </p>
            <Link
              href="/blog"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-md font-semibold hover:bg-red-700 transition-colors text-lg"
            >
              Explore Articles
            </Link>
          </div>

          {/* Right side image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end z-10">
            <div className="relative w-full max-w-lg h-80 md:h-96 lg:h-[500px]">
              <Image
                src="/images/dragon.png"
                alt="Dragon illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* This Day in History Widget - Preserved */}
      <ThisDayInHistory />

      {/* Fan Articles */}
      <FanArticles />

      {/* Featured Posts */}
      <section className="mb-16 bg-[#f8f7f2] p-8 rounded-lg border border-[#eae9e4]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Articles
          </h2>
          <Link href="/blog" className="text-red-800 hover:text-red-600">
            View All Articles
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden p-4 article-card border border-[#eae9e4]"
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
                    className="text-gray-800 hover:text-red-800"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">{post.date}</p>
                <p className="text-gray-700">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-block mt-4 text-red-800 hover:text-red-600"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Eras */}
      <section className="mb-16 bg-[#f8f7f2] p-8 rounded-lg border border-[#eae9e4]">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Explore Historical Eras
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {historicalEras.map((era) => (
            <Link
              key={era.name}
              href={era.url}
              className="bg-white p-4 rounded-lg shadow-sm text-center hover:bg-[#f5f4ef] transition-all border border-[#eae9e4]"
            >
              {era.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-[#f8f7f2] p-8 rounded-lg mb-12 border border-[#eae9e4]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Stay Updated
          </h2>
          <p className="mb-6 text-gray-700">
            Subscribe to our newsletter to receive the latest articles and
            historical insights.
          </p>
          <form className="flex flex-col md:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-md border border-[#eae9e4] focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
