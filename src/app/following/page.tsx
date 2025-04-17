"use client";

import FollowingFeed from "@/components/FollowingFeed";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function FollowingPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Following Feed</h1>
            <p className="text-gray-600">
              Stay updated with the latest articles from people you follow
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/feed"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              Community Feed
            </Link>
            {user && (
              <Link
                href="/write"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Write Article
              </Link>
            )}
          </div>
        </div>

        <FollowingFeed />

        {user && (
          <div className="mt-12 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              Find More Users to Follow
            </h2>
            <p className="text-gray-600 mb-4">
              Discover more writers and expand your reading network
            </p>
            <Link
              href="/search-users"
              className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
            >
              Search Users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
