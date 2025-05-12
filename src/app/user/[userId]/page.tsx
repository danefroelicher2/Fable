// src/app/user/[userId]/page.tsx (modified)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import UserPublishedArticles from "@/components/UserPublishedArticles";
import FavoriteArticles from "@/components/FavoriteArticles";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import PinnedPosts from "@/components/PinnedPosts";
import SocialLinks from "@/components/SocialLinks"; // Import the new SocialLinks component

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
  // Add state for social links
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
  });
  // Add follower/following counts
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);

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

        // Only try to access localStorage on the client side
        if (typeof window !== "undefined") {
          // Get bio from localStorage
          const savedBio = localStorage.getItem("userBio_" + userId);
          if (savedBio) {
            setBio(savedBio);
          }

          // Get social links from localStorage
          const savedSocialLinks = localStorage.getItem(
            "userSocialLinks_" + userId
          );
          if (savedSocialLinks) {
            try {
              setSocialLinks(JSON.parse(savedSocialLinks));
            } catch (e) {
              console.error("Error parsing social links:", e);
            }
          }
        }

        // Get follower and following counts
        try {
          // Get followers count (people who follow this user)
          const { count: followersCount, error: followersError } = await (
            supabase as any
          )
            .from("follows")
            .select("id", { count: "exact" })
            .eq("following_id", userId);

          if (followersError) throw followersError;

          // Get following count (people this user follows)
          const { count: followingCountData, error: followingError } = await (
            supabase as any
          )
            .from("follows")
            .select("id", { count: "exact" })
            .eq("follower_id", userId);

          if (followingError) throw followingError;

          setFollowerCount(followersCount || 0);
          setFollowingCount(followingCountData || 0);

          // Fetch user's published articles
          try {
            const { data: articlesData, error: articlesError } = await (
              supabase as any
            )
              .from("public_articles")
              .select("id")
              .eq("user_id", userId)
              .eq("is_published", true);

            if (articlesError) throw articlesError;
            setArticles(articlesData || []);
          } catch (articlesErr) {
            console.error("Error fetching user articles:", articlesErr);
            setArticles([]);
          }
        } catch (err) {
          console.error("Error fetching follow stats:", err);
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
              {/* Header with name/username and edit button */}
              <div className="flex justify-between items-start mb-2">
                {/* Name and Username */}
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.full_name ||
                      profile?.username ||
                      "Anonymous User"}
                  </h2>
                  {profile?.username && (
                    <p className="text-gray-600">@{profile.username}</p>
                  )}
                </div>

                {/* Edit Profile button moved to top right */}
                {isCurrentUser && (
                  <button
                    onClick={() => {
                      router.push("/profile");
                      localStorage.setItem("startInEditMode", "true");
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
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
                )}
              </div>

              {/* Posts/Followers/Following counts */}
              <div className="flex space-x-6 mb-4">
                {/* NEW: Posts count */}
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">
                    {articles?.length || 0}
                  </span>
                  <span className="text-gray-600 text-sm">Posts</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">{followerCount}</span>
                  <span className="text-gray-600 text-sm">Followers</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">{followingCount}</span>
                  <span className="text-gray-600 text-sm">Following</span>
                </div>
              </div>

              {/* BIO - removed the "Bio" heading as requested */}
              {bio && (
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}

              {/* SOCIAL LINKS - Display only icons, no usernames */}
              <SocialLinks socialLinks={socialLinks} className="mb-4" />

              {/* Action buttons */}
              {!isCurrentUser && profile && (
                <div className="flex space-x-2 mt-4">
                  <MessageButton recipientId={profile.id} variant="secondary" />
                  <FollowButton targetUserId={profile.id} />
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
