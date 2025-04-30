"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Community {
  id: string;
  name: string;
  image_url: string | null;
}

export default function CreateCommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  const communityId = Array.isArray(params?.communityId)
    ? params.communityId[0]
    : params?.communityId;

  useEffect(() => {
    if (communityId) {
      checkCommunity();
    }
  }, [communityId, user]);

  async function checkCommunity() {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to create a post");
        return;
      }

      // Get community info
      const { data: communityData, error: communityError } = await (
        supabase as any
      )
        .from("communities")
        .select("id, name, image_url")
        .eq("id", communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);

      // Check if user is a member
      const { data: memberData, error: memberError } = await (supabase as any)
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberData) {
        setError("You must be a member of this community to create posts");
        setIsMember(false);
      } else {
        setIsMember(true);
      }
    } catch (err) {
      console.error("Error checking community:", err);
      setError("Failed to load community information");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!isMember) {
      setError("You must be a member of this community to create posts");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a post title");
      return;
    }

    if (!content.trim()) {
      setError("Please enter post content");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Insert the new community post
      const { data, error: postError } = await (supabase as any)
        .from("community_posts")
        .insert({
          community_id: communityId,
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (postError) throw postError;

      // Redirect to the post page
      router.push(`/communities/${communityId}/posts/${data.id}`);
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
      setSubmitting(false);
    }
  }

  // If still loading
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // If error or not a member
  if (error && !isMember) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="flex justify-between">
            <Link
              href={`/communities/${communityId}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Return to Community
            </Link>
            <Link
              href={`/communities/${communityId}/join`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {community && (
          <div className="flex items-center mb-6">
            <Link
              href={`/communities/${communityId}`}
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              ← Back to {community.name}
            </Link>
            <h1 className="text-2xl font-bold">
              Create Post in {community.name}
            </h1>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your post title"
              required
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={10}
              placeholder="Write your post content here..."
              required
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href={`/communities/${communityId}`}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
