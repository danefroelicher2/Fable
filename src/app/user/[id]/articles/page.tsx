"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserArticles from "@/components/UserArticles";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function UserArticlesPage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  async function fetchProfile() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data as Profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">User Not Found</h1>
          <p className="text-lg mb-6">
            {error || "This user doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/profile/${userId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Profile
          </Link>
        </div>

        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-4 overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              (
                profile.username?.charAt(0) ||
                profile.full_name?.charAt(0) ||
                "U"
              ).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {profile.full_name || profile.username || "Anonymous User"}'s
              Articles
            </h1>
            <p className="text-gray-600">All published articles</p>
          </div>
        </div>

        {/* User Articles - No limit, don't show "View All" */}
        <UserArticles userId={userId} limit={50} showViewAll={false} />
      </div>
    </div>
  );
}
