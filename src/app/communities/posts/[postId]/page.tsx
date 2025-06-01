// src/app/communities/posts/[postId]/page.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BookmarkButton from "@/components/BookmarkButton";
import LikeButton from "@/components/LikeButton";
import CommunityCommentSection from "@/components/CommunityCommentSection";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  community_id: string;
  user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  community?: {
    name: string;
    image_url: string | null;
  };
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const communityId = Array.isArray(params?.communityId)
    ? params.communityId[0]
    : params?.communityId;

  const postId = Array.isArray(params?.postId)
    ? params.postId[0]
    : params?.postId;

  useEffect(() => {
    if (communityId && postId) {
      fetchPostData();
    }
  }, [communityId, postId, user]);

  // Fetch like count for community posts
  async function fetchPostLikeCount(postId: string) {
    try {
      // Using the same likes table with post_id field
      const { count, error } = await (supabase as any)
        .from("likes")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      if (error) {
        console.warn("Error fetching post like count:", error);
        setLikeCount(0);
      } else {
        setLikeCount(count || 0);
      }
    } catch (err) {
      console.error("Error fetching post like count:", err);
      setLikeCount(0);
    }
  }

  async function handleDeletePost() {
    if (!user || !post || user.id !== post.user_id) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone and will remove all comments."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      // First, delete all comments on this post
      const { error: commentsError } = await (supabase as any)
        .from("community_post_comments")
        .delete()
        .eq("post_id", postId);

      if (commentsError) {
        console.error("Error deleting post comments:", commentsError);
        throw commentsError;
      }

      // Delete any likes for this post
      try {
        const { error: likesError } = await (supabase as any)
          .from("likes")
          .delete()
          .eq("post_id", postId);

        if (likesError) {
          console.warn("Error deleting post likes:", likesError);
        }
      } catch (likesErr) {
        console.warn("Error with likes deletion:", likesErr);
      }

      // Delete any bookmarks for this post
      try {
        const { error: bookmarksError } = await (supabase as any)
          .from("bookmarks")
          .delete()
          .eq("post_id", postId);

        if (bookmarksError) {
          console.warn("Error deleting post bookmarks:", bookmarksError);
        }
      } catch (bookmarkErr) {
        console.warn("Error with bookmarks deletion:", bookmarkErr);
      }

      // Finally, delete the post itself
      const { error: postError } = await (supabase as any)
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (postError) {
        console.error("Error deleting post:", postError);
        throw postError;
      }

      // Redirect to community page
      router.push(`/communities/${communityId}`);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
      setLoading(false);
    }
  }

  async function fetchPostData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch the post details without using join syntax to avoid issues
      const { data: postData, error: postError } = await (supabase as any)
        .from("community_posts")
        .select("*")
        .eq("id", postId)
        .eq("community_id", communityId)
        .single();

      if (postError) throw postError;

      if (!postData) {
        setError("Post not found");
        setLoading(false);
        return;
      }

      // Fetch user profile separately
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", postData.user_id)
        .single();

      if (userError) {
        console.warn("Error fetching user profile:", userError);
      }

      // Fetch community data separately
      const { data: communityData, error: communityError } = await (
        supabase as any
      )
        .from("communities")
        .select("name, image_url")
        .eq("id", communityId)
        .single();

      if (communityError) {
        console.warn("Error fetching community data:", communityError);
      }

      // Combine the data
      const combinedPost = {
        ...postData,
        user: userData || null,
        community: communityData || null,
      };

      setPost(combinedPost);

      // Fetch like count for this post
      if (postData.id) {
        await fetchPostLikeCount(postData.id);
      }

      // Check if current user is a community member
      if (user) {
        const { data: memberData, error: memberError } = await (supabase as any)
          .from("community_members")
          .select("id")
          .eq("community_id", communityId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!memberError) {
          setIsMember(!!memberData);
        }
      }
    } catch (err) {
      console.error("Error fetching post data:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            {error || "Post Not Found"}
          </h1>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href={`/communities/${communityId}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link
            href="/communities"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Communities
          </Link>{" "}
          /{" "}
          <Link
            href={`/communities/${communityId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {post.community?.name || "Community"}
          </Link>{" "}
          / Post
        </div>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 dark:bg-gray-800">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              {post.title}
            </h1>

            <div className="flex items-center mb-6">
              <Link
                href={`/user/${post.user_id}`}
                className="flex items-center"
              >
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3 overflow-hidden">
                  {post.user?.avatar_url ? (
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">
                      {(post.user?.username || post.user?.full_name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {post.user?.full_name || post.user?.username || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Posted on {formatDate(post.created_at)}
                  </div>
                </div>
              </Link>
            </div>

            {/* Delete button section - only show for post author */}
            {user && post.user_id === user.id && (
              <div className="mt-4 mb-6 flex justify-end">
                <button
                  onClick={handleDeletePost}
                  className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            )}

            {/* Post content */}
            <div className="prose max-w-none mb-6 dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Like Button Integration for Community Posts */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-center">
                <LikeButton
                  postId={post.id}
                  initialLikeCount={likeCount}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Post actions with bookmark button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Bookmark Button */}
                <BookmarkButton
                  postId={post.id}
                  size="md"
                  showText={true}
                  preventNavigation={true}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
                />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section for Community Posts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 dark:bg-gray-800">
          <div className="p-6">
            <CommunityCommentSection
              postId={post.id}
              communityId={communityId || ""}
              isMember={isMember}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
