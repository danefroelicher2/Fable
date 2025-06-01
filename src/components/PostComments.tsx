// src/components/PostComments.tsx - TYPESCRIPT FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  replies?: Comment[];
  reply_count?: number;
}

interface PostCommentsProps {
  postId: string;
  isExpanded: boolean;
  onToggle: () => void;
  commentCount: number;
}

export default function PostComments({
  postId,
  isExpanded,
  onToggle,
  commentCount,
}: PostCommentsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      fetchComments();
    }
  }, [isExpanded, postId]);

  async function fetchComments() {
    if (!postId) return;

    try {
      setLoading(true);

      // Fetch only parent comments (comments without parent_id)
      const { data: parentCommentsData, error: commentsError } = await (
        supabase as any
      )
        .from("community_post_comments")
        .select("*")
        .eq("post_id", postId)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        return;
      }

      // Fetch user profiles and reply counts for each parent comment
      const commentsWithData = await Promise.all(
        (parentCommentsData || []).map(async (comment: Comment) => {
          try {
            // Fetch user profile
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", comment.user_id)
              .single();

            if (userError) {
              console.warn(
                `Error fetching user for comment ${comment.id}:`,
                userError
              );
            }

            // Count replies for this comment
            const { count: replyCount, error: countError } = await (
              supabase as any
            )
              .from("community_post_comments")
              .select("id", { count: "exact" })
              .eq("parent_id", comment.id);

            if (countError) {
              console.warn(
                `Error counting replies for comment ${comment.id}:`,
                countError
              );
            }

            return {
              ...comment,
              user: userData || null,
              reply_count: replyCount || 0,
              replies: [],
            };
          } catch (err) {
            console.error(`Error processing comment ${comment.id}:`, err);
            return {
              ...comment,
              user: null,
              reply_count: 0,
              replies: [],
            };
          }
        })
      );

      setComments(commentsWithData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }

  // Function to fetch replies for a specific comment
  async function fetchReplies(parentCommentId: string): Promise<Comment[]> {
    try {
      const { data: repliesData, error: repliesError } = await (supabase as any)
        .from("community_post_comments")
        .select("*")
        .eq("parent_id", parentCommentId)
        .order("created_at", { ascending: true });

      if (repliesError) {
        console.error("Error fetching replies:", repliesError);
        return [];
      }

      // Fetch user profiles for each reply
      const repliesWithUsers = await Promise.all(
        (repliesData || []).map(async (reply: Comment) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", reply.user_id)
              .single();

            if (userError) {
              console.warn(
                `Error fetching user for reply ${reply.id}:`,
                userError
              );
              return {
                ...reply,
                user: null,
              };
            }

            return {
              ...reply,
              user: userData,
            };
          } catch (err) {
            console.error(`Error processing reply ${reply.id}:`, err);
            return {
              ...reply,
              user: null,
            };
          }
        })
      );

      return repliesWithUsers;
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  }

  // Function to toggle replies visibility and fetch them if needed
  async function toggleReplies(commentId: string) {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    const isCurrentlyExpanded = expandedReplies.has(commentId);

    if (
      !isCurrentlyExpanded &&
      (!comment.replies || comment.replies.length === 0)
    ) {
      // Fetch replies if not already loaded
      const replies = await fetchReplies(commentId);

      // Update the comment with its replies
      setComments((prevComments) =>
        prevComments.map((c) => (c.id === commentId ? { ...c, replies } : c))
      );
    }

    // Toggle expanded state - FIXED: Convert Set to Array then back to Set
    setExpandedReplies((prev) => {
      const newSet = new Set([...Array.from(prev)]);
      if (isCurrentlyExpanded) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }

  // Function to submit a reply
  async function handleSubmitReply(parentCommentId: string) {
    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const { data, error } = await (supabase as any)
        .from("community_post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: replyText.trim(),
          parent_id: parentCommentId,
        })
        .select();

      if (error) throw error;

      // Get the parent comment's user for notification
      const parentComment = comments.find((c) => c.id === parentCommentId);
      if (parentComment && parentComment.user_id !== user.id) {
        try {
          await (supabase as any).from("notifications").insert({
            user_id: parentComment.user_id,
            action_type: "comment",
            action_user_id: user.id,
            post_id: postId,
            comment_id: data[0].id,
            created_at: new Date().toISOString(),
            is_read: false,
          });
        } catch (notifyError) {
          console.error("Error creating reply notification:", notifyError);
        }
      }

      // Get the complete reply data with user profile
      const { data: replyWithProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!fetchError) {
        const newReply: Comment = {
          ...data[0],
          user: replyWithProfile,
        };

        // Update the parent comment with the new reply
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === parentCommentId) {
              const updatedReplies = comment.replies
                ? [...comment.replies, newReply]
                : [newReply];
              return {
                ...comment,
                replies: updatedReplies,
                reply_count: (comment.reply_count || 0) + 1,
              };
            }
            return comment;
          })
        );

        // Make sure replies are visible - FIXED: Convert Set to Array then back to Set
        setExpandedReplies(
          (prev) => new Set([...Array.from(prev), parentCommentId])
        );
      }

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  }

  // FIXED: Separate functions for deleting comments and replies
  async function handleDeleteComment(commentId: string, commentUserId: string) {
    if (!user || user.id !== commentUserId) {
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("community_post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Remove parent comment from local state
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  }

  async function handleDeleteReply(
    replyId: string,
    replyUserId: string,
    parentId: string
  ) {
    if (!user || user.id !== replyUserId) {
      return;
    }

    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("community_post_comments")
        .delete()
        .eq("id", replyId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Remove reply from parent comment
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== replyId),
              reply_count: Math.max(0, (comment.reply_count || 0) - 1),
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("Failed to delete reply. Please try again.");
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
      {/* Toggle Comments Button - ONLY show if there are comments */}
      {commentCount > 0 && (
        <button
          onClick={onToggle}
          className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span>
            {isExpanded ? "Hide" : "View"} {commentCount}{" "}
            {commentCount === 1 ? "Comment" : "Comments"}
          </span>
        </button>
      )}

      {/* Comments List */}
      {isExpanded && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                {/* Main Comment */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Link
                      href={`/user/${comment.user_id}`}
                      className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-2 overflow-hidden">
                        {comment.user?.avatar_url ? (
                          <img
                            src={comment.user.avatar_url}
                            alt={comment.user.username || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">
                            {(
                              comment.user?.username ||
                              comment.user?.full_name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {comment.user?.full_name ||
                          comment.user?.username ||
                          "Anonymous"}
                      </span>
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  {/* Delete button for comment author */}
                  {user && user.id === comment.user_id && (
                    <button
                      onClick={() =>
                        handleDeleteComment(comment.id, comment.user_id)
                      }
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                  {comment.content}
                </p>

                {/* Action buttons for main comment */}
                <div className="flex items-center space-x-4 text-xs">
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {replyingTo === comment.id ? "Cancel" : "Reply"}
                  </button>

                  {/* Only show the view replies button if there are actual replies */}
                  {comment.reply_count && comment.reply_count > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 mr-1 transform transition-transform ${
                          expandedReplies.has(comment.id) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      {expandedReplies.has(comment.id) ? "Hide" : "View"}{" "}
                      {comment.reply_count}{" "}
                      {comment.reply_count === 1 ? "Reply" : "Replies"}
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && user && (
                  <div className="mt-3 ml-8 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                    <div className="flex items-start space-x-2">
                      <div className="h-5 w-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden flex-shrink-0">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                          placeholder={`Reply to ${
                            comment.user?.full_name ||
                            comment.user?.username ||
                            "Anonymous"
                          }...`}
                          rows={2}
                          required
                        />
                        <div className="mt-1 flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
                          >
                            {submittingReply ? "Posting..." : "Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies Section */}
                {expandedReplies.has(comment.id) &&
                  comment.replies &&
                  comment.replies.length > 0 && (
                    <div className="mt-3 ml-8 border-l-2 border-gray-200 dark:border-gray-600 pl-3 space-y-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded p-2"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              <Link
                                href={`/user/${reply.user_id}`}
                                className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-2 overflow-hidden">
                                  {reply.user?.avatar_url ? (
                                    <img
                                      src={reply.user.avatar_url}
                                      alt={reply.user.username || "User"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs">
                                      {(
                                        reply.user?.username ||
                                        reply.user?.full_name ||
                                        "U"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium text-xs">
                                  {reply.user?.full_name ||
                                    reply.user?.username ||
                                    "Anonymous"}
                                </span>
                              </Link>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>

                            {/* Delete button for reply author - FIXED: Use separate function */}
                            {user && user.id === reply.user_id && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(
                                    reply.id,
                                    reply.user_id,
                                    comment.id
                                  )
                                }
                                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
