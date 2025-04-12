// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Format a date to "time ago" (e.g. "5 minutes ago", "2 hours ago", "3 days ago")
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000); // years
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000); // months
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400); // days
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600); // hours
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60); // minutes
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}

// Define types for our comments
interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Combined display type
interface CommentDisplay extends Comment {
  authorName: string;
  authorAvatar: string | null;
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<CommentDisplay[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments when the component mounts
  useEffect(() => {
    if (articleId) {
      loadComments();
    }
  }, [articleId]);

  // Function to load comments
  async function loadComments() {
    setLoading(true);
    setError(null);

    try {
      // Fetch comments first
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // For each comment, fetch the profile data separately
      const displayComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // Get profile data for this comment
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", comment.user_id)
            .single();

          return {
            ...comment,
            authorName:
              profileData?.full_name ||
              profileData?.username ||
              "Anonymous User",
            authorAvatar: profileData?.avatar_url || null,
          };
        })
      );

      setComments(displayComments);
    } catch (err: any) {
      console.error("Error loading comments:", err);
      setError(`Failed to load comments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Function to submit a new comment
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      // Insert the new comment
      const { data: newCommentData, error: insertError } = await supabase
        .from("comments")
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select("*") // Just select the comment data, not relationships
        .single();

      if (insertError) throw insertError;

      // Get the current user's profile data (we already have user.id)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      // Create the display comment with author info
      const commentDisplay: CommentDisplay = {
        ...newCommentData,
        authorName:
          profileData?.full_name || profileData?.username || "Anonymous User",
        authorAvatar: profileData?.avatar_url || null,
      };

      // Update the comments list
      setComments([commentDisplay, ...comments]);
      setCommentText("");
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      setError(`Failed to post comment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-6 dark:text-white">
        Comments ({comments.length})
      </h3>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden">
                {user.email ? (
                  <span className="text-lg font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="text-lg font-medium">U</span>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                placeholder="Add a comment..."
                rows={3}
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
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
            Sign in to join the conversation
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent(
              window.location.pathname
            )}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Sign In
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">
            Be the first to comment on this article!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex">
              <div className="mr-3 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden">
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-1">
                    <span className="font-medium dark:text-white mr-2">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(comment.created_at)}
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
  );
}
