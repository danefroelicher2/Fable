// src/app/communities/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Community {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  image_url: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  creator?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  category?: string;
}

export default function CommunitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"discover" | "my-communities">(
    "discover"
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [isInCategory, setIsInCategory] = useState(false);

  // Complete list of categories
  const categories = [
    { id: "technology", name: "Technology" },
    { id: "entertainment", name: "Entertainment" },
    { id: "education", name: "Education" },
    { id: "sports", name: "Sports" },
    { id: "art", name: "Art" },
    { id: "food", name: "Food" },
    { id: "science", name: "Science" },
    { id: "history", name: "History" },
    { id: "gaming", name: "Gaming" },
    { id: "health", name: "Health" },
    { id: "travel", name: "Travel" },
  ];

  useEffect(() => {
    fetchCommunities();
  }, [user, activeTab, activeCategory]);

  useEffect(() => {
    setIsInCategory(activeCategory !== "all");
  }, [activeCategory]);

  async function fetchCommunities() {
    try {
      setLoading(true);
      setError(null);

      // First, fetch communities without trying to join with profiles
      let query = (supabase as any)
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeTab === "my-communities" && user) {
        // Get communities the user is a member of
        const { data: membershipData, error: membershipError } = await (
          supabase as any
        )
          .from("community_members")
          .select("community_id")
          .eq("user_id", user.id);

        if (membershipError) throw membershipError;

        if (membershipData && membershipData.length > 0) {
          const communityIds = membershipData.map(
            (item: any) => item.community_id
          );
          query = query.in("id", communityIds);
        } else {
          // User is not a member of any communities
          setCommunities([]);
          setLoading(false);
          return;
        }
      }

      // Apply category filter if not "all"
      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Now, for each community, get the creator's profile separately
      const communitiesWithCreators = await Promise.all(
        (data || []).map(async (community: Community) => {
          try {
            // Get creator profile
            const { data: creatorData, error: creatorError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", community.creator_id)
              .single();

            if (creatorError) {
              console.warn(
                `Error fetching creator for community ${community.id}:`,
                creatorError
              );
              return {
                ...community,
                creator: null,
              };
            }

            // Get member count
            const { count: memberCount, error: countError } = await (
              supabase as any
            )
              .from("community_members")
              .select("id", { count: "exact", head: true })
              .eq("community_id", community.id);

            if (countError) {
              console.warn(
                `Error getting member count for community ${community.id}:`,
                countError
              );
            }

            // Check if current user is a member
            let isMember = false;
            if (user) {
              const { data: memberData, error: memberError } = await (
                supabase as any
              )
                .from("community_members")
                .select("id")
                .eq("community_id", community.id)
                .eq("user_id", user.id)
                .maybeSingle();

              if (!memberError) {
                isMember = !!memberData;
              }
            }

            return {
              ...community,
              creator: creatorData,
              member_count: memberCount || 0,
              is_member: isMember,
            };
          } catch (err) {
            console.error(
              `Error getting data for community ${community.id}:`,
              err
            );
            return {
              ...community,
              creator: null,
              member_count: 0,
              is_member: false,
            };
          }
        })
      );

      setCommunities(communitiesWithCreators);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Handle back to main view
  const handleBackToMain = () => {
    setActiveCategory("all");
  };

  async function handleJoinCommunity(communityId: string) {
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent("/communities")}`);
      return;
    }

    try {
      // Add user to community members
      const { error } = await (supabase as any)
        .from("community_members")
        .insert({
          community_id: communityId,
          user_id: user.id,
          is_admin: false,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? {
                ...community,
                member_count: (community.member_count || 0) + 1,
                is_member: true,
              }
            : community
        )
      );
    } catch (err) {
      console.error("Error joining community:", err);
      alert("Failed to join community. Please try again.");
    }
  }

  async function handleLeaveCommunity(communityId: string) {
    if (!user) return;

    try {
      // Remove user from community members
      const { error } = await (supabase as any)
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? {
                ...community,
                member_count: Math.max(0, (community.member_count || 1) - 1),
                is_member: false,
              }
            : community
        )
      );

      // If on my communities tab, remove this community from the list
      if (activeTab === "my-communities") {
        setCommunities((prev) =>
          prev.filter((community) => community.id !== communityId)
        );
      }
    } catch (err) {
      console.error("Error leaving community:", err);
      alert("Failed to leave community. Please try again.");
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">
              Communities
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join communities to connect with others and share knowledge
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/communities/create"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create Community
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-6 py-3 text-lg font-medium border-b-2 ${
                activeTab === "discover"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab("my-communities")}
              className={`px-6 py-3 text-lg font-medium border-b-2 ${
                activeTab === "my-communities"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Communities
            </button>
          </div>
        </div>

        {/* Category navigation area */}
        {activeTab === "discover" && (
          <div className="py-0 px-0 mb-4">
            <div className="relative overflow-x-auto scrollbar-hide py-1">
              <div className="flex whitespace-nowrap space-x-3">
                {/* Up Arrow (only when in a specific category) */}
                {isInCategory && (
                  <button
                    onClick={handleBackToMain}
                    className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex items-center justify-center"
                    aria-label="Back to all communities"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  </button>
                )}

                {/* Category tabs - now always displayed */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            {activeTab === "discover" ? (
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {activeCategory === "all"
                  ? "No communities have been created yet. Be the first to create one!"
                  : `No communities found in the ${activeCategory} category. Be the first to create one!`}
              </p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You haven't joined any communities yet.
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 font-medium"
                >
                  Discover Communities
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div
                key={community.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 overflow-hidden">
                      {community.image_url ? (
                        <img
                          src={community.image_url}
                          alt={community.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          {community.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/communities/${community.id}`}
                        className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {community.name}
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created by{" "}
                        <Link
                          href={`/user/${community.creator_id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {community.creator?.full_name ||
                            community.creator?.username ||
                            "Anonymous"}
                        </Link>{" "}
                        • {formatDate(community.created_at)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {community.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between mt-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {community.member_count}{" "}
                      {community.member_count === 1 ? "member" : "members"}
                    </span>
                    {community.is_member ? (
                      <button
                        onClick={() => handleLeaveCommunity(community.id)}
                        className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
