// Updated version of the component that creates posts in a community
// Based on src/app/communities/[communityId]/create-post/page.tsx or an equivalent component

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function CreateCommunityPostPage() {
  const { communityId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
      checkMembership();
    }
  }, [communityId, user]);

  async function fetchCommunityDetails() {
    try {
      setLoading(true);

      // Fetch the community details
      const { data, error } = await (supabase as any)
        .from("communities")
        .select("id, name, description, creator_id")
        .eq("id", communityId)
        .single();

      if (error) throw error;

      setCommunity(data);
    } catch (err) {
      console.error("Error fetching community:", err);
      setError("Failed to load community details");
    } finally {
      setLoading(false);
    }
  }

  async function checkMembership() {
    try {
      if (!user) return false;

      const { data, error } = await (supabase as any)
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setIsMember(!!data);
      return !!data;
    } catch (err) {
      console.error("Error checking membership:", err);
      return false;
    }
  }

  // New function that creates both a community post and a public article
  async function createPostAndPublicArticle() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (!isMember) {
      setError("You must be a member of this community to post");
      return;
    }

    setPosting(true);
    setError(null);

    try {
      // First create the community post
      const { data: postData, error: postError } = await (supabase as any)
        .from("community_posts")
        .insert({
          title,
          content,
          user_id: user.id,
          community_id: communityId,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (postError) throw postError;

      // Now create a corresponding public article
      // Use the community name as the category with a prefix
      const slug =
        title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-") +
        "-" +
        Date.now().toString().substring(8);

      const excerpt =
        content.substring(0, 150) + (content.length > 150 ? "..." : "");

      const { data: articleData, error: articleError } = await (supabase as any)
        .from("public_articles")
        .insert({
          user_id: user.id,
          title,
          content,
          excerpt,
          category: `community:${community.name}`, // Store community name with prefix
          slug,
          is_published: true,
          published_at: new Date().toISOString(),
          view_count: 0,
          community_post_id: postData.id, // Link back to community post
        });

      if (articleError) throw articleError;

      // Redirect to the community post
      router.push(`/communities/${communityId}/posts/${postData.id}`);
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Community Not Found
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

  // Check if user is signed in
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            You need to sign in to create a post in this community.
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent(
              window.location.pathname
            )}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is a member of the community
  if (!isMember) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Membership Required
          </h1>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            You need to be a member of this community to create posts.
          </p>
          <Link
            href={`/communities/${communityId}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Join Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">
            Create a Post in {community.name}
          </h1>
          <Link
            href={`/communities/${communityId}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Community
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
          <div className="p-6">
            <div className="mb-6">
              <label
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Give your post a title"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                htmlFor="content"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="What do you want to share with the community?"
                rows={8}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You can use Markdown formatting in your post.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={createPostAndPublicArticle}
                disabled={posting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800"
              >
                {posting ? "Posting..." : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
