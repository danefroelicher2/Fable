// src/app/communities/[communityId]/page.tsx - UPDATED WITH INLINE LIKE/COMMENT
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import LikeButton from "@/components/LikeButton";
import PostComments from "@/components/PostComments";

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
  like_count?: number;
  comment_count?: number;
}

interface CommunityMember {
  id: string;
  user_id: string;
  is_admin: boolean;
  joined_at: string;
  user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// 🔥 NEW: Quick Comment Component for inline commenting
interface QuickCommentProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

function QuickComment({
  postId,
  isVisible,
  onClose,
  onCommentAdded,
}: QuickCommentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isVisible) return null;

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(
        "/signin?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any)
        .from("community_post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim(),
          parent_id: null,
        })
        .select();

      if (error) throw error;

      // Create notification for post owner
      try {
        const { data: postData, error: postError } = await (supabase as any)
          .from("community_posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (!postError && postData && postData.user_id !== user.id) {
          await (supabase as any).from("notifications").insert({
            user_id: postData.user_id,
            action_type: "comment",
            action_user_id: user.id,
            post_id: postId,
            comment_id: data[0].id,
            created_at: new Date().toISOString(),
            is_read: false,
          });
        }
      } catch (notifyError) {
        console.error("Error with notification:", notifyError);
      }

      setCommentText("");
      onCommentAdded();
      onClose();
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      <form onSubmit={handleSubmitComment}>
        <div className="flex items-start space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              placeholder="Add a comment..."
              rows={2}
              required
            />
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
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
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [communityBanner, setCommunityBanner] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // 🔥 NEW: State for inline commenting
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(
    null
  );

  // State for community editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [isEditingCommunity, setIsEditingCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [uploadedBannerUrl, setUploadedBannerUrl] = useState<string | null>(
    null
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const MAX_DESCRIPTION_LENGTH = 500;

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
    if (communityId && activeTab === "posts") {
      fetchCommunityPosts();
    } else if (communityId && activeTab === "members") {
      fetchCommunityMembers();
    }
  }, [activeTab, communityId]);

  // 🔥 NEW: Function to fetch post stats (likes and comments)
  async function fetchPostStats(postId: string) {
    try {
      // Get like count
      const { count: likeCount, error: likeError } = await (supabase as any)
        .from("likes")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      // Get comment count
      const { count: commentCount, error: commentError } = await (
        supabase as any
      )
        .from("community_post_comments")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      return {
        like_count: likeError ? 0 : likeCount || 0,
        comment_count: commentError ? 0 : commentCount || 0,
      };
    } catch (err) {
      console.error("Error fetching post stats:", err);
      return { like_count: 0, comment_count: 0 };
    }
  }

  async function fetchCommunityData() {
    try {
      setLoading(true);
      setError(null);

      if (!communityId) {
        setError("Community ID is missing");
        setLoading(false);
        return;
      }

      // Fetch the community details
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

      const updatedCommunity = {
        ...communityData,
        creator: creatorData || null,
        member_count: memberCount || 0,
        post_count: postCount || 0,
        is_member: isMember,
        is_admin: isAdmin,
      };

      setCommunity(updatedCommunity);
      setDescriptionText(communityData.description || "");
      setDescriptionCharCount(communityData.description?.length || 0);
      setCommunityName(communityData.name || "");
      setCommunityBanner(communityData.banner_url);
      setUploadedBannerUrl(communityData.banner_url);
      setUploadedImageUrl(communityData.image_url);

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

      // Fetch posts
      const { data: postsData, error: postsError } = await (supabase as any)
        .from("community_posts")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching community posts:", postsError);
        throw postsError;
      }

      // 🔥 UPDATED: Fetch user profiles and post stats for each post
      const postsWithData = await Promise.all(
        (postsData || []).map(async (post: any) => {
          try {
            // Fetch user profile
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
            }

            // Fetch post stats (likes and comments)
            const stats = await fetchPostStats(post.id);

            return {
              ...post,
              user: userData || null,
              like_count: stats.like_count,
              comment_count: stats.comment_count,
            };
          } catch (err) {
            console.error(`Error processing post ${post.id}:`, err);
            return {
              ...post,
              user: null,
              like_count: 0,
              comment_count: 0,
            };
          }
        })
      );

      setPosts(postsWithData);
    } catch (err) {
      console.error("Error fetching community posts:", err);
    }
  }

  async function fetchCommunityMembers() {
    try {
      if (!communityId) return;

      const { data: membersData, error: membersError } = await (supabase as any)
        .from("community_members")
        .select("id, user_id, is_admin, joined_at")
        .eq("community_id", communityId)
        .order("joined_at", { ascending: false });

      if (membersError) {
        console.error("Error fetching community members:", membersError);
        throw membersError;
      }

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

  // 🔥 NEW: Handle comment refresh after adding a comment
  async function handleCommentAdded() {
    // Refresh posts to update comment counts
    await fetchCommunityPosts();
  }

  // 🔥 NEW: Toggle quick comment
  function toggleQuickComment(postId: string) {
    if (!user) {
      router.push(
        "/signin?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (!community?.is_member) {
      alert("You must be a member of this community to comment.");
      return;
    }

    setActiveCommentPost(activeCommentPost === postId ? null : postId);
  }

  // Function to update community
  async function updateCommunity() {
    if (!community || !user || user.id !== community.creator_id) return;

    try {
      setLoading(true);

      const updates: any = {};

      if (communityName !== community.name) {
        updates.name = communityName;
      }

      if (descriptionText !== community.description) {
        updates.description = descriptionText;
      }

      if (uploadedBannerUrl !== community.banner_url) {
        updates.banner_url = uploadedBannerUrl;
      }

      if (uploadedImageUrl !== community.image_url) {
        updates.image_url = uploadedImageUrl;
      }

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();

        const { error } = await (supabase as any)
          .from("communities")
          .update(updates)
          .eq("id", community.id)
          .eq("creator_id", user.id);

        if (error) throw error;

        setCommunity({
          ...community,
          ...updates,
        });

        setCommunityBanner(uploadedBannerUrl);
      }

      setIsEditingCommunity(false);
    } catch (err) {
      console.error("Error updating community:", err);
      alert("Failed to update community. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !community) return;

    try {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 1) {
        throw new Error("File size exceeds 1MB limit for data URL storage");
      }

      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });

      reader.readAsDataURL(file);
      const dataUrl = await dataUrlPromise;

      setUploadedBannerUrl(dataUrl);
      setCommunityBanner(dataUrl);

      console.log("Converted image to data URL successfully");
    } catch (err) {
      console.error("Error processing image:", err);
      alert(
        `Failed to upload image: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
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
      const { error } = await (supabase as any)
        .from("community_members")
        .insert({
          community_id: communityId,
          user_id: user.id,
          is_admin: false,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

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
      const { error } = await (supabase as any)
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

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

  function handleDeletePost(
    postId: string,
    userId: string,
    event: React.MouseEvent
  ) {
    event.stopPropagation();

    if (!user || user.id !== userId) {
      return;
    }

    setPostToDelete({ id: postId, userId });
    setShowDeleteModal(true);
  }

  async function executePostDeletion() {
    if (!postToDelete) return;

    const { id: postId, userId } = postToDelete;

    try {
      const { error: commentsError } = await (supabase as any)
        .from("community_post_comments")
        .delete()
        .eq("post_id", postId);

      if (commentsError) {
        console.error("Error deleting post comments:", commentsError);
        throw commentsError;
      }

      try {
        const { error: bookmarksError } = await (supabase as any)
          .from("bookmarks")
          .delete()
          .eq("post_id", postId);

        if (bookmarksError) {
          console.error("Error deleting post bookmarks:", bookmarksError);
        }
      } catch (bookmarkErr) {
        console.error("Error with bookmarks deletion:", bookmarkErr);
      }

      const { error: postError } = await (supabase as any)
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId);

      if (postError) {
        console.error("Error deleting post:", postError);
        throw postError;
      }

      setPosts(posts.filter((post) => post.id !== postId));
      setPostToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
      setShowDeleteModal(false);
    }
  }

  function handleDeleteCommunity() {
    if (!user || !community || user.id !== community.creator_id) {
      return;
    }
    setShowDeleteCommunityModal(true);
  }

  async function executeCommunityDeletion() {
    try {
      setLoading(true);
      setShowDeleteCommunityModal(false);

      if (!user || !communityId) {
        console.error("User or community ID is null");
        setLoading(false);
        return;
      }

      console.log("Starting community deletion process for:", communityId);

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

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map((post: any) => post.id);

        try {
          console.log("Deleting bookmarks for posts...");
          const { error: bookmarksError } = await (supabase as any)
            .from("bookmarks")
            .delete()
            .in("post_id", postIds);

          if (bookmarksError) {
            console.warn("Error deleting post bookmarks:", bookmarksError);
          }
        } catch (err) {
          console.warn("Error with bookmark deletion:", err);
        }

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

      console.log("Deleting all community posts...");
      const { error: postsError } = await (supabase as any)
        .from("community_posts")
        .delete()
        .eq("community_id", communityId);

      if (postsError) {
        console.error("Error deleting community posts:", postsError);
        throw postsError;
      }

      console.log("Deleting community members...");
      const { error: membersError } = await (supabase as any)
        .from("community_members")
        .delete()
        .eq("community_id", communityId);

      if (membersError) {
        console.error("Error deleting community members:", membersError);
        throw membersError;
      }

      console.log("Deleting the community...");
      const { error: communityError } = await (supabase as any)
        .from("communities")
        .delete()
        .eq("id", communityId)
        .eq("creator_id", user.id);

      if (communityError) {
        console.error("Error deleting community:", communityError);
        throw communityError;
      }

      console.log("Community deletion successful!");
      router.push("/communities");
    } catch (err) {
      console.error("Error deleting community:", err);
      alert("Failed to delete community. Please try again.");
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDescription = (description: string, maxLength: number = 500) => {
    if (description.length <= maxLength || showFullDescription)
      return description;

    return description.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-60 bg-gray-300 rounded-lg mb-4 dark:bg-gray-700"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-3 dark:text-white">
            {error || "Community Not Found"}
          </h1>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
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
    <div className="container mx-auto py-6 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="absolute left-4 top-6 z-10">
          <Link
            href="/communities"
            className="flex items-center justify-center p-3 rounded-full bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70 transition"
            aria-label="Back to communities"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Community Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 dark:bg-gray-800">
          <div
            className={
              communityBanner
                ? "h-76 relative"
                : "h-88 bg-gradient-to-r from-blue-500 to-purple-600 relative"
            }
          >
            {communityBanner ? (
              <img
                src={communityBanner}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <h1 className="text-4xl font-bold text-white">
                  {community.name}
                </h1>
              </div>
            )}

            {/* Banner edit overlay */}
            {isEditingCommunity && user && community.creator_id === user.id && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerUpload}
                  />
                  Change Banner Image
                </label>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                {isEditingCommunity &&
                user &&
                community.creator_id === user.id ? (
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    className="text-3xl font-bold mb-1 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Community Name"
                    maxLength={50}
                  />
                ) : (
                  <h1 className="text-3xl font-bold dark:text-white">
                    {community.name}
                  </h1>
                )}
              </div>

              <div className="flex flex-col space-y-1 mt-2 md:mt-0">
                {user && community.creator_id === user.id ? (
                  <>
                    {!isEditingCommunity ? (
                      <button
                        onClick={() => setIsEditingCommunity(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Edit Community
                      </button>
                    ) : (
                      <button
                        onClick={updateCommunity}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    )}

                    <button
                      onClick={handleDeleteCommunity}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Delete Community"}
                    </button>
                  </>
                ) : community.is_member ? (
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

            {/* Community stats */}
            <div className="flex items-center space-x-6 mt-4 text-sm font-medium">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
                {community.member_count} members
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
                {community.post_count} posts
              </div>
            </div>

            <div className="mt-6">
              {isEditingDescription && community.is_admin ? (
                <div className="space-y-2">
                  <textarea
                    value={descriptionText}
                    onChange={(e) => {
                      const newText = e.target.value;
                      if (newText.length <= MAX_DESCRIPTION_LENGTH) {
                        setDescriptionText(newText);
                        setDescriptionCharCount(newText.length);
                      }
                    }}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe your community..."
                    rows={4}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {descriptionCharCount}/{MAX_DESCRIPTION_LENGTH} characters
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingDescription(false);
                          if (community) {
                            setDescriptionText(community.description);
                            setDescriptionCharCount(
                              community.description.length
                            );
                          }
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!community) return;

                          try {
                            const { error } = await (supabase as any)
                              .from("communities")
                              .update({ description: descriptionText })
                              .eq("id", community.id);

                            if (error) throw error;

                            setCommunity({
                              ...community,
                              description: descriptionText,
                            });
                            setIsEditingDescription(false);
                          } catch (err) {
                            console.error("Error updating description:", err);
                            alert("Failed to update description");
                          }
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    About this community
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatDescription(community.description)}
                    {community.description.length > 500 &&
                      !showFullDescription && (
                        <button
                          onClick={() => setShowFullDescription(true)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Show more
                        </button>
                      )}
                    {community.description.length > 500 &&
                      showFullDescription && (
                        <button
                          onClick={() => setShowFullDescription(false)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Show less
                        </button>
                      )}
                  </p>

                  {community.is_admin && (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit description
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`relative px-2 py-3 text-lg font-semibold transition-all duration-300 ${
                    activeTab === "posts"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Posts
                  {activeTab === "posts" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("members")}
                  className={`relative px-2 py-3 text-lg font-semibold transition-all duration-300 ${
                    activeTab === "members"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Members
                  {activeTab === "members" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              </div>

              {community.is_member && (
                <button
                  onClick={() =>
                    router.push(`/communities/${communityId}/create-post`)
                  }
                  className="px-6 py-3 text-lg font-semibold transition-all duration-300 flex items-center space-x-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                  <span>Post</span>
                </button>
              )}
            </div>
          </div>

          {/* 🔥 UPDATED: Tab Content with Inline Like and Comment */}
          <div className="p-6">
            {activeTab === "posts" && (
              <div>
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
                    {posts.map((post) => {
                      const isExpanded = expandedPosts.has(post.id);
                      const maxLength = 350;
                      const needsTruncation = post.content.length > maxLength;
                      const displayContent =
                        needsTruncation && !isExpanded
                          ? post.content.substring(0, maxLength) + "..."
                          : post.content;

                      const toggleExpanded = (
                        postId: string,
                        e: React.MouseEvent
                      ) => {
                        e.stopPropagation();
                        setExpandedPosts((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(postId)) {
                            newSet.delete(postId);
                          } else {
                            newSet.add(postId);
                          }
                          return newSet;
                        });
                      };

                      return (
                        <div
                          key={post.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          {/* Title */}
                          <h3
                            className="text-lg font-bold mb-3 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/communities/${communityId}/posts/${post.id}`
                              )
                            }
                          >
                            {post.title}
                          </h3>

                          {/* Content with proper line wrapping */}
                          <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                              {displayContent}
                            </p>

                            {needsTruncation && (
                              <button
                                onClick={(e) => toggleExpanded(post.id, e)}
                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 font-medium"
                              >
                                {isExpanded ? "Read less" : "Read more"}
                              </button>
                            )}
                          </div>

                          {/* User info and date */}
                          <div className="flex items-center text-sm mb-4">
                            <Link
                              href={`/user/${post.user_id}`}
                              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3 overflow-hidden">
                                {post.user?.avatar_url ? (
                                  <img
                                    src={post.user.avatar_url}
                                    alt={post.user.username || "User"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs">
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

                              <div className="flex flex-col">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {post.user?.full_name ||
                                    post.user?.username ||
                                    "Anonymous"}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatDate(post.created_at)}
                                </span>
                              </div>
                            </Link>
                          </div>

                          {/* Action Bar with Like and Comment */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <div className="flex items-center justify-between">
                              {/* Left side: Like and Comment buttons */}
                              <div className="flex items-center space-x-4">
                                {/* Like Button */}
                                <div onClick={(e) => e.stopPropagation()}>
                                  <LikeButton
                                    postId={post.id}
                                    initialLikeCount={post.like_count || 0}
                                    className="text-sm"
                                  />
                                </div>

                                {/* Comment Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleQuickComment(post.id);
                                  }}
                                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
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
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                  <span>Comment</span>
                                </button>
                              </div>

                              {/* Right side: Other actions */}
                              <div className="flex items-center space-x-3">
                                {/* Share Button */}
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ShareButton
                                    postId={post.id}
                                    title={post.title}
                                    size="sm"
                                  />
                                </div>

                                {/* Bookmark Button */}
                                <div className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <BookmarkButton postId={post.id} />
                                </div>

                                {/* Delete Button (Only visible to post author) */}
                                {user && user.id === post.user_id && (
                                  <button
                                    onClick={(e) =>
                                      handleDeletePost(post.id, post.user_id, e)
                                    }
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Quick Comment Section */}
                            <QuickComment
                              postId={post.id}
                              isVisible={activeCommentPost === post.id}
                              onClose={() => setActiveCommentPost(null)}
                              onCommentAdded={handleCommentAdded}
                            />

                            {/* NEW: Comments Display Section */}
                            <PostComments
                              postId={post.id}
                              isExpanded={expandedPosts.has(
                                `comments-${post.id}`
                              )}
                              onToggle={() => {
                                setExpandedPosts((prev) => {
                                  const newSet = new Set(prev);
                                  const key = `comments-${post.id}`;
                                  if (newSet.has(key)) {
                                    newSet.delete(key);
                                  } else {
                                    newSet.add(key);
                                  }
                                  return newSet;
                                });
                              }}
                              commentCount={post.comment_count || 0}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Members Tab (unchanged) */}
            {activeTab === "members" && (
              <div>
                {(() => {
                  const uniqueMembers = members.reduce(
                    (acc: CommunityMember[], member: CommunityMember) => {
                      const existingMember = acc.find(
                        (m: CommunityMember) => m.user_id === member.user_id
                      );
                      if (!existingMember) {
                        acc.push(member);
                      }
                      return acc;
                    },
                    [] as CommunityMember[]
                  );

                  const sortedMembers = uniqueMembers.sort(
                    (a: CommunityMember, b: CommunityMember) => {
                      if (a.is_admin && !b.is_admin) return -1;
                      if (!a.is_admin && b.is_admin) return 1;

                      return (
                        new Date(b.joined_at).getTime() -
                        new Date(a.joined_at).getTime()
                      );
                    }
                  );

                  return sortedMembers.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <p className="text-gray-600 dark:text-gray-300">
                        No members in this community yet.
                        {!community.is_member && " Be the first to join!"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Community Members ({sortedMembers.length})
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {
                            sortedMembers.filter(
                              (m: CommunityMember) => m.is_admin
                            ).length
                          }{" "}
                          admin(s),{" "}
                          {
                            sortedMembers.filter(
                              (m: CommunityMember) => !m.is_admin
                            ).length
                          }{" "}
                          member(s)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMembers.map((member: CommunityMember) => (
                          <div
                            key={`${member.id}-${member.user_id}`}
                            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Link
                              href={`/user/${member.user_id}`}
                              className="flex items-center flex-1"
                            >
                              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3 overflow-hidden flex-shrink-0">
                                {member.user?.avatar_url ? (
                                  <img
                                    src={member.user.avatar_url}
                                    alt={member.user.username || "User"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-semibold">
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

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                                    {member.user?.full_name ||
                                      member.user?.username ||
                                      "Anonymous"}
                                  </div>
                                  {member.is_admin && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {member.user?.username &&
                                    `@${member.user.username}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {formatDate(member.joined_at)}
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Post Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and will remove all comments."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={executePostDeletion}
        onCancel={() => setShowDeleteModal(false)}
        confirmButtonColor="red"
      />

      {/* Delete Community Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteCommunityModal}
        title="Delete Community"
        message="Are you sure you want to delete this community? This action cannot be undone and will remove all posts and comments."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={executeCommunityDeletion}
        onCancel={() => setShowDeleteCommunityModal(false)}
        confirmButtonColor="red"
      />
    </div>
  );
}
