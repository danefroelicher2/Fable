// Updated version of the component that displays individual community posts
// Based on src/app/communities/[communityId]/posts/[postId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

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

  async function fetchPostData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch the post details
      const { data, error } = await (supabase as any)
        .from("community_posts")
        .select(
          `
          *,
          user:profiles!community_posts_user_id_fkey(username, full_name, avatar_url),
          community:communities!community_posts_community_id_fkey(name, image_url)
        `
        )
        .eq("id", postId)
        .eq("community_id", communityId)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Post not found");
        setLoading(false);
        return;
      }

      setPost(data);

      // Fetch comments for this post
      fetchComments();

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

  async function fetchComments() {
    try {
      if (!postId) return;

      const { data, error } = await (supabase as any)
        .from("community_post_comments")
        .select(
          `
          *,
          user:profiles!community_post_comments_user_id_fkey(username, full_name, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!commentText.trim() || !postId) return;

    setSubmitting(true);
    try {
      // Insert the comment
      const { data, error } = await (supabase as any)
        .from("community_post_comments")
        .insert({
          content: commentText.trim(),
          post_id: postId,
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      // Then get the complete data with profiles joined
      const { data: commentWithProfile, error: fetchError } = await (
        supabase as any
      )
        .from("community_post_comments")
        .select(
          `
          *,
          user:profiles!community_post_comments_user_id_fkey(username, full_name, avatar_url)
        `
        )
        .eq("id", data[0].id)
        .single();

      if (fetchError) throw fetchError;

      // Add the new comment to the list
      setComments((prev) => [...prev, commentWithProfile]);

      // Clear the comment form
      setCommentText("");
    } catch (error: any) {
      console.error("Error submitting comment:", error.message || error);
    } finally {
      setSubmitting(false);
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

            {/* Added Community Label */}
            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                {post.community?.name || "Community"}
              </span>
            </div>

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

            <div className="prose max-w-none mb-6 dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 dark:text-white">
              Comments ({comments.length})
            </h2>

            {isMember ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add a comment..."
                      rows={3}
                      required
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
                      >
                        {submitting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-8 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Join this community to comment on posts
                </p>
                <Link
                  href={`/communities/${communityId}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Join Community
                </Link>
              </div>
            )}

            {comments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <Link href={`/user/${comment.user_id}`}>
                          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden">
                            {comment.user?.avatar_url ? (
                              <img
                                src={comment.user.avatar_url}
                                alt={comment.user.username || "User"}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              (
                                comment.user?.username ||
                                comment.user?.full_name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                        </Link>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <Link href={`/user/${comment.user_id}`}>
                            <span className="font-medium mr-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                              {comment.user?.full_name ||
                                comment.user?.username ||
                                "Anonymous"}
                            </span>
                          </Link>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
