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
  banner_url: string | null;
  created_at: string;
  updated_at: string | null;
  member_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
  creator?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  category: string | null;
}

export default function CommunitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "discover" | "my-communities" | "create"
  >("discover");
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

  async function handleJoinCommunity(communityId: string, e: React.MouseEvent) {
    // Prevent the click from bubbling up to the parent elements
    e.stopPropagation();

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

  async function handleLeaveCommunity(
    communityId: string,
    e: React.MouseEvent
  ) {
    // Prevent the click from bubbling up to the parent elements
    e.stopPropagation();

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

  // Function to navigate to a community
  const navigateToCommunity = (communityId: string) => {
    // This should match the path pattern in your [communityId]/page.tsx file
    router.push(`/communities/${communityId}`);
  };

  // Handle Create Community tab click
  const handleCreateCommunity = () => {
    router.push("/communities/create");
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* UPDATED: Enhanced Tabs Section - Moved Higher and Improved */}
        <div className="mb-8">
          {/* Main Tabs Container with improved styling */}
          <div className="flex justify-between items-center border-b-2 border-gray-100 dark:border-gray-700 pb-4">
            {/* Left Side - Main Navigation Tabs */}
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("discover")}
                className={`relative px-2 py-3 text-lg font-semibold transition-all duration-300 ${
                  activeTab === "discover"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Discover
                {/* Active indicator */}
                {activeTab === "discover" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("my-communities")}
                className={`relative px-2 py-3 text-lg font-semibold transition-all duration-300 ${
                  activeTab === "my-communities"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                My Communities
                {/* Active indicator */}
                {activeTab === "my-communities" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>
            </div>

            {/* Right Side - Create Community Tab */}
            <button
              onClick={handleCreateCommunity}
              className={`relative px-6 py-3 text-lg font-semibold transition-all duration-300 flex items-center space-x-2 rounded-lg ${
                activeTab === "create"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Create Community</span>
            </button>
          </div>
        </div>

        {/* Category Navigation - Only show for Discover tab */}
        {activeTab === "discover" && (
          <div className="mb-6">
            <div className="relative overflow-x-auto scrollbar-hide py-2">
              <div className="flex whitespace-nowrap space-x-3">
                {/* Up Arrow (only when in a specific category) */}
                {isInCategory && (
                  <button
                    onClick={handleBackToMain}
                    className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center"
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

                {/* Category tabs */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? "bg-blue-500 text-white dark:bg-blue-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-40 bg-gray-300 dark:bg-gray-700 w-full mb-4 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            {activeTab === "discover" ? (
              <div>
                <div className="text-6xl mb-4">🏘️</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  {activeCategory === "all"
                    ? "No communities found"
                    : `No communities in ${activeCategory}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {activeCategory === "all"
                    ? "No communities have been created yet. Be the first to create one!"
                    : `No communities found in the ${activeCategory} category. Be the first to create one!`}
                </p>
                <button
                  onClick={handleCreateCommunity}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Create Community
                </button>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  No communities joined yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You haven't joined any communities yet. Discover and join
                  communities that interest you!
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Discover Communities
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div
                key={community.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigateToCommunity(community.id)}
              >
                {/* Image section */}
                <div className="h-40 bg-gray-200 dark:bg-gray-700 w-full">
                  {community.banner_url ? (
                    <img
                      src={community.banner_url}
                      alt={community.name}
                      className="h-full w-full object-cover"
                    />
                  ) : community.image_url ? (
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-4xl font-bold text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
                    {community.name}
                  </h3>

                  {/* Member count directly below title */}
                  <div className="mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {community.member_count || 0}{" "}
                      {community.member_count === 1 ? "member" : "members"}
                    </span>
                  </div>

                  {community.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                      {community.description}
                    </p>
                  )}

                  {/* Bottom row with topic badge on left and action button on right */}
                  <div className="flex justify-between items-center">
                    {/* Topic Badge - Only show when viewing "all" categories */}
                    {activeTab === "discover" && activeCategory === "all" ? (
                      <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                        {community.category || "general"}
                      </span>
                    ) : (
                      <div></div> /* Empty div to maintain spacing when no badge */
                    )}

                    {community.is_member ? (
                      <button
                        onClick={(e) => handleLeaveCommunity(community.id, e)}
                        className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleJoinCommunity(community.id, e)}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
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
