// src/app/page.tsx
"use client";

import Link from "next/link";
import ThisDayInHistory from "@/components/ThisDayInHistory";
import FanArticles from "@/components/FanArticles";
import Image from "next/image";
import CommunityFeedHeading from "@/components/CommunityFeedHeading";
import AutoScrollingCommunityFeed from "@/components/AutoScrollingCommunityFeed";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeWriters: 0,
    storiesShared: 0,
    totalReaders: 0,
    loading: true,
  });

  // Fetch real-time stats from database
  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total number of users (readers)
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Get number of active writers (users who have published at least 1 article)
        const { data: activeWritersData, error: writersError } = await (
          supabase as any
        )
          .from("public_articles")
          .select("user_id")
          .eq("is_published", true);

        if (writersError) throw writersError;

        // Get unique writer count using Array.from() instead of spread operator
        const uniqueWriterIds = new Set(
          activeWritersData?.map((article: any) => article.user_id) || []
        );
        const uniqueWriters = Array.from(uniqueWriterIds);

        // Get total published stories
        const { count: totalStories, error: storiesError } = await (
          supabase as any
        )
          .from("public_articles")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true);

        if (storiesError) throw storiesError;

        setStats({
          activeWriters: uniqueWriters.length,
          storiesShared: totalStories || 0,
          totalReaders: totalUsers || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchStats();

    // Set up real-time subscription for updates
    const subscription = supabase
      .channel("stats-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "public_articles",
        },
        () => {
          fetchStats(); // Refetch stats when articles change
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStats(); // Refetch stats when profiles change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section - Using exact specified color #FAE3C6 */}
      <div className="relative overflow-hidden bg-[#FAF0D7] rounded-lg mb-12 border border-[#e8d2b5]">
        {/* Sign In/Sign Up buttons - Only show when user is NOT logged in */}
        {!user && (
          <div className="absolute top-4 right-4 z-20 flex space-x-3">
            <Link
              href="/signin"
              className="bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="font-bold text-black">Sign In</span>
            </Link>
            <Link
              href="/signin"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors shadow-sm"
            >
              <span className="font-bold text-white">Sign Up</span>
            </Link>
          </div>
        )}

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

        {/* Explore Button - Bottom Center */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={() => {
              const nextSection = document.querySelector("#next-section");
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="flex flex-col items-center group cursor-pointer bg-white/80 backdrop-blur-sm px-6 py-4 rounded-full border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <span className="font-bold text-gray-900 mb-2">Explore</span>
            <svg
              className="w-6 h-6 text-gray-900 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* This Day in History Widget */}
      <div id="next-section">
        <ThisDayInHistory />
      </div>

      {/* NEW: Community Articles Section */}
      <section className="mb-16">
        <CommunityFeedHeading />
        <div className="bg-[#f8f7f2] p-6 rounded-lg border border-[#eae9e4]">
          <AutoScrollingCommunityFeed />
        </div>
      </section>

      {/* Featured Articles */}
      <FanArticles />

      {/* About Section */}
      <section className="bg-[#f8f7f2] p-8 rounded-lg mb-12 border border-[#eae9e4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              About Fable
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Contact Information: writefable@gmail.com
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Our Mission */}
            <div className="bg-white p-6 rounded-lg border border-[#eae9e4]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-700">
                To create a vibrant community where writers and readers connect
                through the power of storytelling. We believe every story has
                the potential to inspire, educate, and transform lives.
              </p>
            </div>

            {/* What We Offer */}
            <div className="bg-white p-6 rounded-lg border border-[#eae9e4]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  What We Offer
                </h3>
              </div>
              <p className="text-gray-700">
                A platform for both fiction and non-fiction writers to share
                their work, connect with readers, discover new stories, and be
                part of a supportive creative community.
              </p>
            </div>
          </div>

          {/* Community Features */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Join Our Growing Community
            </h3>
            <div className="grid grid-cols-3 gap-8 mb-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {stats.loading ? "..." : stats.activeWriters}
                </div>
                <div className="text-gray-600">Active Writers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.loading ? "..." : stats.storiesShared}
                </div>
                <div className="text-gray-600">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.loading ? "..." : stats.totalReaders}
                </div>
                <div className="text-gray-600">Readers</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/write"
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                <span className="text-white font-bold">
                  Start Writing Today
                </span>
              </Link>
              <Link
                href="/feed"
                className="bg-white text-gray-900 px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                <span className="text-black font-bold">Explore Stories</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
