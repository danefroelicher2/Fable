"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserPublishedArticles from "@/components/UserPublishedArticles";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  // Note: bio is stored in localStorage, not in the database
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/not-found");
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, website")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setError("User not found");
            router.push("/not-found");
            return;
          }
          throw error;
        }

        setProfile(data);

        // Bio is stored in localStorage on the user's device
        // For public viewing, we can't access it, but if user is viewing their own profile
        // we can try to retrieve it from localStorage (client-side only)
        if (typeof window !== "undefined") {
          const savedBio = localStorage.getItem("userBio_" + userId);
          if (savedBio) {
            setBio(savedBio);
          }
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
        setError("Failed to load profile data: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
              <div className="h-48 w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {profile?.username?.charAt(0).toUpperCase() ||
                      profile?.full_name?.charAt(0).toUpperCase() ||
                      "U"}
                  </span>
                )}
              </div>
            </div>

            <div className="md:w-2/3 md:pl-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.full_name || profile?.username || "Anonymous User"}
                </h2>
                {profile?.username && (
                  <p className="text-gray-600">@{profile.username}</p>
                )}

                {profile?.website && (
                  <p className="text-gray-600 mt-2">
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </p>
                )}
              </div>

              {bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User's Published Articles */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Published Articles</h2>
              </div>
              {profile && (
                <UserPublishedArticles userId={profile.id} displayType="grid" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
