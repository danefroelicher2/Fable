// src/app/page.tsx
import Link from "next/link";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import FanArticles from "@/components/FanArticles";
import Image from "next/image";
import CommunityFeedHeading from "@/components/CommunityFeedHeading";
import AutoScrollingCommunityFeed from "@/components/AutoScrollingCommunityFeed";

// Mock data for testing - featured posts
const featuredPosts = [
  {
    id: "1",
    title: "imagetest",
    slug: "t-059683",
    date: "April 10, 2025",
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
      {/* Hero Section - Using exact specified color #FAE3C6 */}
      <div className="relative overflow-hidden bg-[#FAF0D7] rounded-lg mb-12 border border-[#e8d2b5]">
        {/* Very subtle texture */}
        <div
          className="absolute inset-0 opacity-5 bg-repeat"
          style={{
            backgroundImage:
              "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgcAAABkklEQVR4nJXTiZaDIAwE0EmBEFagCNj//86AolZbjnMqr0l2JgFZVY0xKi/v+/6IOGecc9baBoe01o7jcTfHrXZZFuAdnsfD9OdZiVJKkTWHcj8u5ZrVelIrmexRRYn5TaJQpH9brchXVKtdO2R7rbYQ2Z+kWl1Ny/J68Flr7TxniwLeB0e1wundQFjnlBoTOegdxGq1+XiNQx4uJx51zZ1EnsT1ujhELW7OS7icrLWO291ygbZtw2mt9ZSY1Fzj4fwCB5WrP5Uk+dmRrxMRbStF1OtEMtpWdl498D8JrTY/qXzVHvKLRGSWbFCvvWzkDxJRx9PlfugheZK9wyPw2F9HxIaJ5K4zJTKCbCNP4nZNUmQn38e4NcldZ0qEiO5+dzV5kNzIa3BPMpFcyCsxX0leZGpkWCMbYh8k/0AkYJtPA4+pDb6QQw8Ri5sy5aLcnDHHAmVC5FBW1Q5BTjLV0iiK/KJDqR6Fofq4MqikiFGnxYVUZXk5l4QYKXXKUTnRr4MQIxMRJw4xUnx040114Nq4MILgwgAAAABJRU5ErkJggg==')",
          }}
        ></div>

        <div className="relative flex flex-col md:flex-row items-center py-16 px-6 md:px-12">
          {/* Left side content */}
          <div className="w-full md:w-1/2 text-gray-900 z-10 mb-10 md:mb-0">
            <h2 className="text-2xl font-semibold tracking-wide mb-3">
              WELCOME TO FABLE
            </h2>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Where Stories
              <br />
              Come Alive
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-xl">
              Join a community of writers and readers exploring worlds both real
              and imagined.
            </p>
          </div>

          {/* Right side image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end z-10">
            <div className="relative w-full max-w-lg h-80 md:h-96 lg:h-[500px] overflow-visible">
              <Image
                src="/images/dragonog.png"
                alt="Dragon illustration"
                fill
                className="object-contain scale-[1.6] origin-center translate-x-[-5%] translate-y-[10%] transform-gpu"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* This Day in History Widget */}
      <ThisDayInHistory />

      {/* NEW: Community Articles Section */}
      <section className="mb-16">
        <CommunityFeedHeading />
        <div className="bg-[#f8f7f2] p-6 rounded-lg border border-[#eae9e4]">
          <AutoScrollingCommunityFeed />
        </div>
      </section>

      {/* Fan Articles */}
      <FanArticles />

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
  ); // src/app/page.tsx
}
