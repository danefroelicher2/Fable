// src/app/user/[userId]/page.tsx - UPDATED WITH CLICKABLE FOLLOWERS/FOLLOWING
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
import SocialLinks from "@/components/SocialLinks";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface ProfileData {
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
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
  });
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);

  // NEW: Modal state for followers/following
  const [showFollowModal, setShowFollowModal] = useState<
    "followers" | "following" | null
  >(null);
  const [followList, setFollowList] = useState<ProfileData[]>([]);
  const [loadingList, setLoadingList] = useState(false);

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
          const { count: followersCount, error: followersError } = await (
            supabase as any
          )
            .from("follows")
            .select("id", { count: "exact" })
            .eq("following_id", userId);

          if (followersError) throw followersError;

          const { count: followingCountData, error: followingError } = await (
            supabase as any
          )
            .from("follows")
            .select("id", { count: "exact" })
            .eq("follower_id", userId);

          if (followingError) throw followingError;

          setFollowerCount(followersCount || 0);
          setFollowingCount(followingCountData || 0);

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

  // NEW: Fetch followers/following list
  const fetchFollowList = async (type: "followers" | "following") => {
    // SECURITY: Only allow current user to view their lists
    if (!isCurrentUser) {
      console.log("Access denied: Not current user");
      return;
    }

    try {
      setLoadingList(true);
      setFollowList([]);

      let userIds: string[] = [];

      if (type === "followers") {
        const { data: followerData, error: followerError } = await (
          supabase as any
        )
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);

        if (followerError) throw followerError;
        userIds = followerData.map((item: any) => item.follower_id);
      } else {
        const { data: followingData, error: followingError } = await (
          supabase as any
        )
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        if (followingError) throw followingError;
        userIds = followingData.map((item: any) => item.following_id);
      }

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        setFollowList(profilesData || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type} list:`, error);
    } finally {
      setLoadingList(false);
    }
  };

  // NEW: Open modal (only for current user)
  const openModal = async (type: "followers" | "following") => {
    if (!isCurrentUser) {
      return; // Silent return for security
    }
    setShowFollowModal(type);
    await fetchFollowList(type);
  };

  // NEW: Close modal
  const closeModal = () => {
    setShowFollowModal(null);
    setFollowList([]);
  };

  // NEW: Modal component with Twitter/X style layout
  const FollowModal = () => {
    if (!showFollowModal || !isCurrentUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-white">
              {showFollowModal === "followers" ? "Followers" : "Following"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-70px)]">
            {loadingList ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-3 text-gray-600 dark:text-white">Loading...</p>
              </div>
            ) : followList.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold mb-2">
                  {showFollowModal === "followers"
                    ? "No followers yet"
                    : "Not following anyone yet"}
                </h3>
                <p className="text-sm">
                  {showFollowModal === "followers"
                    ? "When people follow you, they'll appear here."
                    : "When you follow people, they'll appear here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {followList.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side - Avatar and User Info */}
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.username || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                              {(profile.username || profile.full_name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                              {profile.full_name ||
                                profile.username ||
                                "Anonymous User"}
                            </h4>
                            {/* Verification badge could go here if you have that feature */}
                          </div>
                          {profile.username && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              @{profile.username}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side - Action Button */}
                      <div className="flex-shrink-0 ml-4">
                        <a
                          href={`/user/${profile.id}`}
                          className="inline-flex items-center px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={closeModal}
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              <div className="flex justify-between items-start mb-2">
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

              {/* UPDATED: Posts/Followers/Following counts with clickable functionality */}
              <div className="flex space-x-6 mb-4">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">
                    {articles?.length || 0}
                  </span>
                  <span className="text-gray-600 text-sm">Posts</span>
                </div>

                {/* CLICKABLE FOLLOWERS - Only for current user */}
                <button
                  onClick={() => openModal("followers")}
                  className={`flex flex-col items-center ${
                    isCurrentUser
                      ? "hover:opacity-80 cursor-pointer"
                      : "cursor-default"
                  }`}
                  disabled={!isCurrentUser}
                  title={isCurrentUser ? "Click to view followers" : ""}
                >
                  <span className="font-bold text-lg">{followerCount}</span>
                  <span className="text-gray-600 text-sm">Followers</span>
                </button>

                {/* CLICKABLE FOLLOWING - Only for current user */}
                <button
                  onClick={() => openModal("following")}
                  className={`flex flex-col items-center ${
                    isCurrentUser
                      ? "hover:opacity-80 cursor-pointer"
                      : "cursor-default"
                  }`}
                  disabled={!isCurrentUser}
                  title={isCurrentUser ? "Click to view following" : ""}
                >
                  <span className="font-bold text-lg">{followingCount}</span>
                  <span className="text-gray-600 text-sm">Following</span>
                </button>
              </div>

              {bio && (
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}

              <SocialLinks socialLinks={socialLinks} className="mb-4" />

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

      {/* Modal for followers/following - Only renders for current user */}
      {isCurrentUser && <FollowModal />}
    </div>
  );
}
