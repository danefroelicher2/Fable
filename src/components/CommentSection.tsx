// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Define a Comment type that can handle replies
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
  reply_count?: number;
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Track which comment we're replying to
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  // Track which comments have expanded replies
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  async function fetchComments() {
    setLoading(true);
    try {
      // First fetch all parent comments (comments without a parent_id)
      const { data: parentComments, error: parentError } = await (
        supabase as any
      )
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          parent_id,
          profiles(username, full_name, avatar_url)
        `
        )
        .eq("article_id", articleId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (parentError) throw parentError;

      // For each parent comment, count its replies
      const commentsWithCounts = await Promise.all(
        (parentComments || []).map(async (comment: Comment) => {
          // Count replies for this comment
          const { count, error: countError } = await (supabase as any)
            .from("comments")
            .select("id", { count: "exact" })
            .eq("article_id", articleId)
            .eq("parent_id", comment.id);

          if (countError) throw countError;

          return {
            ...comment,
            reply_count: count || 0,
            replies: [],
          };
        })
      );

      setComments(commentsWithCounts);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReplies(parentId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          parent_id,
          profiles(username, full_name, avatar_url)
        `
        )
        .eq("article_id", articleId)
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Update the comment with its replies
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: data || [] }
            : comment
        )
      );

      return data || [];
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!user) return;

    try {
      // Delete the comment
      const { error } = await (supabase as any)
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id); // Ensure only the comment owner can delete it

      if (error) throw error;

      // Remove from UI
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  }

  async function handleDeleteReply(parentId: string, replyId: string) {
    if (!user) return;

    try {
      // Delete the reply
      const { error } = await (supabase as any)
        .from("comments")
        .delete()
        .eq("id", replyId)
        .eq("user_id", user.id); // Ensure only the reply owner can delete it

      if (error) throw error;

      // Update the UI
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
    } catch (err) {
      console.error("Error deleting reply:", err);
    }
  }

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
      // First insert the comment
      const { data, error } = await (supabase as any)
        .from("comments")
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: commentText.trim(),
          parent_id: null, // This is a top-level comment
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert");
      }

      try {
        // Fetch article owner id to create notification
        const { data: articleData, error: articleError } = await (
          supabase as any
        )
          .from("public_articles")
          .select("user_id")
          .eq("id", articleId)
          .single();

        if (!articleError && articleData) {
          // Only create notification if the article owner isn't the current user
          if (articleData.user_id !== user.id) {
            // Create a notification for the article owner
            const { error: notificationError } = await (supabase as any)
              .from("notifications")
              .insert({
                user_id: articleData.user_id,
                action_type: "comment",
                action_user_id: user.id,
                article_id: articleId,
                comment_id: data[0].id,
                created_at: new Date().toISOString(),
                is_read: false,
              });

            if (notificationError) {
              console.error(
                "Error creating comment notification:",
                notificationError
              );
              // Continue even if notification creation fails
            }
          }
        }
      } catch (notifyError) {
        // Log but don't prevent the comment action from completing
        console.error("Error with notification:", notifyError);
      }

      // Then get the complete data with profiles joined
      const { data: commentWithProfile, error: fetchError } = await (
        supabase as any
      )
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          parent_id,
          profiles(username, full_name, avatar_url)
        `
        )
        .eq("id", data[0].id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Add the new comment to the top of the list
      setComments((prevComments) => [
        {
          ...commentWithProfile,
          reply_count: 0,
          replies: [],
        },
        ...prevComments,
      ]);

      // Clear the comment form
      setCommentText("");
    } catch (error: any) {
      console.error("Error submitting comment:", error.message || error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitReply(parentId: string) {
    if (!user) {
      router.push(
        "/signin?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      // First insert the reply
      const { data, error } = await (supabase as any)
        .from("comments")
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: replyText.trim(),
          parent_id: parentId, // This is a reply to a parent comment
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert");
      }

      // Get the parent comment's user_id
      const parentComment = comments.find((comment) => comment.id === parentId);
      if (parentComment && parentComment.user_id !== user.id) {
        try {
          // Create a notification for the parent comment author
          const { error: notificationError } = await (supabase as any)
            .from("notifications")
            .insert({
              user_id: parentComment.user_id,
              action_type: "comment", // or "reply" if you want to differentiate
              action_user_id: user.id,
              article_id: articleId,
              comment_id: data[0].id,
              created_at: new Date().toISOString(),
              is_read: false,
            });

          if (notificationError) {
            console.error(
              "Error creating reply notification:",
              notificationError
            );
          }
        } catch (notifyError) {
          console.error("Error with reply notification:", notifyError);
        }
      }

      // Then get the complete data with profiles joined
      const { data: replyWithProfile, error: fetchError } = await (
        supabase as any
      )
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          parent_id,
          profiles(username, full_name, avatar_url)
        `
        )
        .eq("id", data[0].id)
        .single();

      if (fetchError) {
        console.error("Error fetching reply with profile:", fetchError);
        throw fetchError;
      }

      // Update the parent comment with the new reply
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === parentId) {
            // If replies are already loaded, add the new reply
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: [...comment.replies, replyWithProfile],
                reply_count: (comment.reply_count || 0) + 1,
              };
            } else {
              // Just increment the count if replies aren't loaded
              return {
                ...comment,
                reply_count: (comment.reply_count || 0) + 1,
              };
            }
          }
          return comment;
        })
      );

      // Clear the reply form and close it
      setReplyText("");
      setReplyingTo(null);
    } catch (error: any) {
      console.error("Error submitting reply:", error.message || error);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleReplies(commentId: string) {
    // If we haven't loaded the replies yet, fetch them
    const comment = comments.find((c) => c.id === commentId);
    if (
      comment &&
      (!comment.replies || comment.replies.length === 0) &&
      comment.reply_count &&
      comment.reply_count > 0
    ) {
      fetchReplies(commentId);
    }

    // Toggle the expanded state
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Add a comment..."
                rows={3}
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-center">
          <p className="text-gray-700 mb-2">Sign in to join the conversation</p>
          <button
            onClick={() =>
              router.push(
                "/signin?redirect=" +
                  encodeURIComponent(window.location.pathname)
              )
            }
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Be the first to comment on this article!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex">
                <div className="mr-3 flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden">
                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.username || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      (comment.profiles?.username || "U")[0].toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Link
                        href={`/user/${comment.user_id}`}
                        className="font-medium mr-2 hover:text-blue-600"
                      >
                        {comment.profiles?.full_name ||
                          comment.profiles?.username ||
                          "Anonymous"}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    {/* Add delete button if current user is the comment author */}
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>

                  <div className="flex mt-2">
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                    >
                      {replyingTo === comment.id ? "Cancel" : "Reply"}
                    </button>

                    {comment.reply_count && comment.reply_count > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 mr-1 transform transition-transform ${
                            expandedReplies[comment.id] ? "rotate-180" : ""
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
                        {expandedReplies[comment.id] ? "Hide" : "View"}{" "}
                        {comment.reply_count}{" "}
                        {comment.reply_count === 1 ? "Reply" : "Replies"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && user && (
                <div className="mt-3 ml-11">
                  <div className="flex items-start">
                    <div className="mr-3 flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        placeholder={`Reply to ${
                          comment.profiles?.username || "Anonymous"
                        }...`}
                        rows={2}
                        required
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={submitting}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {submitting ? "Posting..." : "Post Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies Section */}
              {expandedReplies[comment.id] &&
                comment.replies &&
                comment.replies.length > 0 && (
                  <div className="mt-3 ml-11 space-y-4 pt-2 border-t border-gray-100">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex">
                        <div className="mr-3 flex-shrink-0">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden">
                            {reply.profiles?.avatar_url ? (
                              <img
                                src={reply.profiles.avatar_url}
                                alt={reply.profiles?.username || "User"}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              (reply.profiles?.username || "U")[0].toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <Link
                                href={`/user/${reply.user_id}`}
                                className="font-medium mr-2 text-sm hover:text-blue-600"
                              >
                                {reply.profiles?.full_name ||
                                  reply.profiles?.username ||
                                  "Anonymous"}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>

                            {/* Add delete button for replies */}
                            {user && user.id === reply.user_id && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(comment.id, reply.id)
                                }
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
