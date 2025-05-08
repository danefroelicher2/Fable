// src/app/communities/[communityId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import BookmarkButton from "@/components/BookmarkButton";
import CommunityBannerUpload from "@/components/CommunityBannerUpload";

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
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [members, setMembers] = useState<any[]>([]);
  const [communityBanner, setCommunityBanner] = useState<string | null>(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    userId: string;
  } | null>(null);
  const [showDeleteCommunityModal, setShowDeleteCommunityModal] =
    useState(false);

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

      // Set banner URL state
      setCommunityBanner(communityData.banner_url);

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

  // Handle post deletion from the community page
  function handleDeletePost(
    postId: string,
    userId: string,
    event: React.MouseEvent
  ) {
    // Stop propagation to prevent navigating to the post page
    event.stopPropagation();

    if (!user || user.id !== userId) {
      return; // Only post authors can delete posts
    }

    // Show the delete confirmation modal
    setPostToDelete({ id: postId, userId });
    setShowDeleteModal(true);
  }

  // Function to execute the actual post deletion
  async function executePostDeletion() {
    if (!postToDelete) return;

    const { id: postId, userId } = postToDelete;

    try {
      // First, delete all comments on this post
      const { error: commentsError } = await (supabase as any)
        .from("community_post_comments")
        .delete()
        .eq("post_id", postId);

      if (commentsError) {
        console.error("Error deleting post comments:", commentsError);
        throw commentsError;
      }

      // Delete any bookmarks for this post
      try {
        const { error: bookmarksError } = await (supabase as any)
          .from("bookmarks")
          .delete()
          .eq("post_id", postId);

        if (bookmarksError) {
          console.error("Error deleting post bookmarks:", bookmarksError);
          // Continue even if bookmarks deletion fails
        }
      } catch (bookmarkErr) {
        console.error("Error with bookmarks deletion:", bookmarkErr);
        // Continue with post deletion even if bookmarks deletion fails
      }

      // Then, delete the post itself
      const { error: postError } = await (supabase as any)
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId); // Extra safety check

      if (postError) {
        console.error("Error deleting post:", postError);
        throw postError;
      }

      // Update the posts list by filtering out the deleted post
      setPosts(posts.filter((post) => post.id !== postId));

      // Reset the state
      setPostToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
      setShowDeleteModal(false);
    }
  }

  // Handle community deletion
  function handleDeleteCommunity() {
    // Security check - only community creator can delete
    if (!user || !community || user.id !== community.creator_id) {
      return;
    }

    // Show the delete community confirmation modal
    setShowDeleteCommunityModal(true);
  }

  // Function to execute the actual community deletion
  async function executeCommunityDeletion() {
    try {
      setLoading(true);
      setShowDeleteCommunityModal(false);

      // Safety check to ensure user exists
      if (!user || !communityId) {
        console.error("User or community ID is null");
        setLoading(false);
        return;
      }

      console.log("Starting community deletion process for:", communityId);

      // 1. First, get all post IDs in this community
      const { data: postsData, error: postsQueryError } = await (
        supabase as any
      )
        .from("community_posts")
        .select("id")
        .eq("community_id", communityId);

      if (postsQueryError) {
        console.error("Error getting community posts:", postsQueryError);
        throw postsQueryError;
      }

      console.log(`Found ${postsData?.length || 0} posts to delete`);

      // If there are posts, delete their comments first
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map((post: any) => post.id);

        // 2. Delete all bookmarks for these posts
        try {
          console.log("Deleting bookmarks for posts...");
          const { error: bookmarksError } = await (supabase as any)
            .from("bookmarks")
            .delete()
            .in("post_id", postIds);

          if (bookmarksError) {
            console.warn("Error deleting post bookmarks:", bookmarksError);
            // Continue even if bookmark deletion fails
          }
        } catch (err) {
          console.warn("Error with bookmark deletion:", err);
          // Continue with deletion even if bookmarks deletion fails
        }

        // 3. Delete all comments on these posts
        console.log("Deleting comments for posts...");
        const { error: commentsError } = await (supabase as any)
          .from("community_post_comments")
          .delete()
          .in("post_id", postIds);

        if (commentsError) {
          console.error("Error deleting post comments:", commentsError);
          throw commentsError;
        }
      }

      // 4. Now delete all community posts
      console.log("Deleting all community posts...");
      const { error: postsError } = await (supabase as any)
        .from("community_posts")
        .delete()
        .eq("community_id", communityId);

      if (postsError) {
        console.error("Error deleting community posts:", postsError);
        throw postsError;
      }

      // 5. Delete all community members
      console.log("Deleting community members...");
      const { error: membersError } = await (supabase as any)
        .from("community_members")
        .delete()
        .eq("community_id", communityId);

      if (membersError) {
        console.error("Error deleting community members:", membersError);
        throw membersError;
      }

      // 6. Finally, delete the community itself
      console.log("Deleting the community...");
      const { error: communityError } = await (supabase as any)
        .from("communities")
        .delete()
        .eq("id", communityId)
        .eq("creator_id", user.id); // Additional security check

      if (communityError) {
        console.error("Error deleting community:", communityError);
        throw communityError;
      }

      console.log("Community deletion successful!");
      // Redirect to communities page
      router.push("/communities");
    } catch (err) {
      console.error("Error deleting community:", err);
      alert("Failed to delete community. Please try again.");
      setLoading(false);
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
}
