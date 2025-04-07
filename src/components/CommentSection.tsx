// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(username, full_name, avatar_url)
        `
        )
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
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
      const { data, error } = await (supabase as any)
        .from("comments")
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(username, full_name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start">
            <div className="mr-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
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
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex">
              <div className="mr-3 flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    (comment.profiles?.username || "U")[0].toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">
                    {comment.profiles?.full_name ||
                      comment.profiles?.username ||
                      "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
