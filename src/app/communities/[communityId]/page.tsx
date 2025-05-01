// src/app/communities/[communityId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  post_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
  creator?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "members" | "about">(
    "posts"
  );
  const [members, setMembers] = useState<any[]>([]);

  const communityId = Array.isArray(params?.communityId)
    ? params.communityId[0]
    : params?.communityId;

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId, user]);

  useEffect(() => {
    // When tab changes, fetch the relevant data
    if (communityId && activeTab === "posts") {
      fetchCommunityPosts();
    } else if (communityId && activeTab === "members") {
      fetchCommunityMembers();
    }
  }, [activeTab, communityId]);

  async function fetchCommunityData() {
    try {
      setLoading(true);
      setError(null);

      if (!communityId) {
        setError("Community ID is missing");
        setLoading(false);
        return;
      }

      // Fetch the community details without using the join syntax
      const { data: communityData, error: communityError } = await (
        supabase as any
      )
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();

      if (communityError) {
        console.error("Error fetching community:", communityError);
        throw communityError;
      }

      if (!communityData) {
        setError("Community not found");
        setLoading(false);
        return;
      }

      // Fetch the creator's profile separately
      const { data: creatorData, error: creatorError } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", communityData.creator_id)
        .single();

      if (creatorError) {
        console.warn(
          `Error fetching creator for community ${communityId}:`,
          creatorError
        );
      }

      // Get member count
      const { count: memberCount, error: countError } = await (supabase as any)
        .from("community_members")
        .select("id", { count: "exact", head: true })
        .eq("community_id", communityId);

      if (countError) {
        console.warn("Error getting member count:", countError);
      }

      // Get post count
      const { count: postCount, error: postCountError } = await (
        supabase as any
      )
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("community_id", communityId);

      if (postCountError) {
        console.warn("Error getting post count:", postCountError);
      }

      // Check if current user is a member and/or admin
      let isMember = false;
      let isAdmin = false;
      if (user) {
        const { data: memberData, error: memberError } = await (supabase as any)
          .from("community_members")
          .select("is_admin")
          .eq("community_id", communityId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!memberError && memberData) {
          isMember = true;
          isAdmin = memberData.is_admin;
        }
      }

      // Set the community data with the additional information
      setCommunity({
        ...communityData,
        creator: creatorData || null,
        member_count: memberCount || 0,
        post_count: postCount || 0,
        is_member: isMember,
        is_admin: isAdmin,
      });

      // Fetch initial posts
      await fetchCommunityPosts();
    } catch (err) {
      console.error("Error fetching community data:", err);
      setError("Failed to load community. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommunityPosts() {
    try {
      if (!communityId) return;

      // Fetch posts without using the join syntax
      const { data: postsData, error: postsError } = await (supabase as any)
        .from("community_posts")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching community posts:", postsError);
        throw postsError;
      }

      // Fetch user profiles for each post separately
      const postsWithUsers = await Promise.all(
        (postsData || []).map(async (post: any) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", post.user_id)
              .single();

            if (userError) {
              console.warn(
                `Error fetching user for post ${post.id}:`,
                userError
              );
              return {
                ...post,
                user: null,
              };
            }

            return {
              ...post,
              user: userData,
            };
          } catch (err) {
            console.error(`Error processing post ${post.id}:`, err);
            return {
              ...post,
              user: null,
            };
          }
        })
      );

      setPosts(postsWithUsers);
    } catch (err) {
      console.error("Error fetching community posts:", err);
      // Not setting global error since it shouldn't prevent viewing the community
    }
  }

  async function fetchCommunityMembers() {
    try {
      if (!communityId) return;

      // Fetch community members without using the join syntax
      const { data: membersData, error: membersError } = await (supabase as any)
        .from("community_members")
        .select("id, user_id, is_admin, joined_at")
        .eq("community_id", communityId)
        .order("joined_at", { ascending: false });

      if (membersError) {
        console.error("Error fetching community members:", membersError);
        throw membersError;
      }

      // Fetch user profiles for each member separately
      const membersWithProfiles = await Promise.all(
        (membersData || []).map(async (member: any) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", member.user_id)
              .single();

            if (userError) {
              console.warn(
                `Error fetching user for member ${member.id}:`,
                userError
              );
              return {
                ...member,
                user: null,
              };
            }

            return {
              ...member,
              user: userData,
            };
          } catch (err) {
            console.error(`Error processing member ${member.id}:`, err);
            return {
              ...member,
              user: null,
            };
          }
        })
      );

      setMembers(membersWithProfiles);
    } catch (err) {
      console.error("Error fetching community members:", err);
    }
  }

  async function handleJoinCommunity() {
    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!communityId) return;

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
      setCommunity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          member_count: (prev.member_count || 0) + 1,
          is_member: true,
        };
      });
    } catch (err) {
      console.error("Error joining community:", err);
      alert("Failed to join community. Please try again.");
    }
  }

  async function handleLeaveCommunity() {
    if (!user || !communityId) return;

    try {
      // Remove user from community members
      const { error } = await (supabase as any)
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setCommunity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          member_count: Math.max(0, (prev.member_count || 1) - 1),
          is_member: false,
          is_admin: false,
        };
      });
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

  // Format content preview
  const formatPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-300 rounded-lg mb-6 dark:bg-gray-700"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            {error || "Community Not Found"}
          </h1>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            The community you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/communities"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Community Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 dark:bg-gray-800">
          {/* Banner Image */}
          {community.banner_url ? (
            <div
              className="h-40 bg-blue-100 dark:bg-blue-900"
              style={{
                backgroundImage: `url(${community.banner_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ) : (
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white">
                {community.name}
              </h1>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4 overflow-hidden">
                  {community.image_url ? (
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1 dark:text-white">
                    {community.name}
                  </h1>
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

              <div>
                {community.is_member ? (
                  <button
                    onClick={handleLeaveCommunity}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Leave Community
                  </button>
                ) : (
                  <button
                    onClick={handleJoinCommunity}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Join Community
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-6 text-sm text-gray-600 dark:text-gray-400">
              <div>{community.member_count} members</div>
              <div>{community.post_count} posts</div>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                {community.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "posts"
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "members"
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "about"
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "posts" && (
              <div>
                {community.is_member && (
                  <div className="mb-6">
                    <Link
                      href={`/communities/${communityId}/create-post`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Create Post
                    </Link>
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">
                      No posts in this community yet.
                      {community.is_member
                        ? " Be the first to create a post!"
                        : " Join this community to post!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <Link
                          href={`/communities/${communityId}/posts/${post.id}`}
                        >
                          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                            {post.title}
                          </h3>
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Link
                            href={`/user/${post.user_id}`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-2 overflow-hidden">
                              {post.user?.avatar_url ? (
                                <img
                                  src={post.user.avatar_url}
                                  alt={post.user.username || "User"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(
                                    post.user?.username ||
                                    post.user?.full_name ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            {post.user?.full_name ||
                              post.user?.username ||
                              "Anonymous"}
                          </Link>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {formatPreview(post.content)}
                        </p>
                        <Link
                          href={`/communities/${communityId}/posts/${post.id}`}
                          className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          Read more
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div>
                {members.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">
                      No members in this community yet.
                      {!community.is_member && " Be the first to join!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <Link
                          href={`/user/${member.user_id}`}
                          className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3 overflow-hidden">
                            {member.user?.avatar_url ? (
                              <img
                                src={member.user.avatar_url}
                                alt={member.user.username || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">
                                {(
                                  member.user?.username ||
                                  member.user?.full_name ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {member.user?.full_name ||
                                member.user?.username ||
                                "Anonymous"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {member.is_admin ? "Admin" : "Member"} • Joined{" "}
                              {formatDate(member.joined_at)}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div>
                <h3 className="text-lg font-bold mb-4 dark:text-white">
                  About This Community
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {community.description}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="mb-2">
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(community.created_at)}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Members:</span>{" "}
                      {community.member_count}
                    </div>
                    <div>
                      <span className="font-medium">Creator:</span>{" "}
                      <Link
                        href={`/user/${community.creator_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {community.creator?.full_name ||
                          community.creator?.username ||
                          "Anonymous"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
