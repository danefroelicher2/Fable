// src/app/user/[userId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import UserPublishedArticles from "@/components/UserPublishedArticles";
import FavoriteArticles from "@/components/FavoriteArticles";
import FollowButton from "@/components/FollowButton";
import FollowStats from "@/components/FollowStats";
import PinnedPosts from "@/components/PinnedPosts";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push("/not-found");
      return;
    }

    setIsCurrentUser(user?.id === userId);

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading public profile for user:", userId);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setError("User not found");
            router.push("/not-found");
            return;
          }
          console.error("Profile fetch error:", error);
          throw error;
        }

        setProfile(data);

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
  }, [userId, router, user]);

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-bold mb-2 md:mb-0">
                    {profile?.full_name ||
                      profile?.username ||
                      "Anonymous User"}
                  </h2>

                  {!isCurrentUser && profile && (
                    <FollowButton targetUserId={profile.id} />
                  )}
                </div>
                {profile?.username && (
                  <p className="text-gray-600">@{profile.username}</p>
                )}
              </div>

              {bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}

              {profile && <FollowStats userId={profile.id} className="mb-4" />}

              {isCurrentUser && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      // Directly navigate to the profile page and set editing mode immediately
                      // This will trigger the editing view instead of the profile view
                      router.push("/profile");
                      // Store the editing state in localStorage to be picked up by the profile page
                      localStorage.setItem("startInEditMode", "true");
                    }}
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Pinned Posts Section */}

        {profile && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Pinned Posts</h2>
            </div>
            <div className="p-6">
              <PinnedPosts userId={profile.id} isCurrentUser={isCurrentUser} />
            </div>
          </div>
        )}
        {/* Favorite Articles Section */}
        {profile && <FavoriteArticles userId={profile.id} />}

        {/* Published Articles Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Published Articles</h2>
          </div>
          <div className="p-6">
            {profile && (
              <UserPublishedArticles
                userId={profile.id}
                displayType="grid"
                limit={12}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
