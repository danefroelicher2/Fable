// src/app/communities/create/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/ImageUpload";

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // Added category state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Category options - matching the ones from the tabs
  const categoryOptions = [
    { id: "", name: "Select a topic (optional)" },
    { id: "sports", name: "Sports" },
    { id: "technology", name: "Technology" },
    { id: "art", name: "Art" },
    { id: "entertainment", name: "Entertainment" },
    { id: "gaming", name: "Gaming" },
    { id: "politics", name: "Politics" },
    { id: "food", name: "Food" },
    { id: "science", name: "Science" },
    { id: "education", name: "Education" },
    { id: "history", name: "History" },
  ];

  useEffect(() => {
    // Redirect if not authenticated
    if (!user && !loading) {
      router.push(
        "/signin?redirect=" + encodeURIComponent("/communities/create")
      );
    }
  }, [user, router, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(
        "/signin?redirect=" + encodeURIComponent("/communities/create")
      );
      return;
    }

    // Validate fields
    if (!name.trim()) {
      setError("Community name is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Insert the new community with category field
      const { data, error: createError } = await (supabase as any)
        .from("communities")
        .insert({
          name: name.trim(),
          description: description.trim(),
          creator_id: user.id,
          image_url: imageUrl,
          category: category || null, // Use the selected category or null if none selected
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add the creator as a member (and admin)
      const { error: memberError } = await (supabase as any)
        .from("community_members")
        .insert({
          community_id: data.id,
          user_id: user.id,
          is_admin: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      setSuccess(true);

      // Redirect to the new community page after a short delay
      setTimeout(() => {
        router.push(`/communities/${data.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating community:", err);
      setError(err.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  // If the user is not logged in, this will redirect (see useEffect)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/communities"
            className="text-blue-600 hover:text-blue-800 mr-4 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Communities
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            Create a New Community
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
            Community created successfully! Redirecting...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2 dark:text-gray-300"
              htmlFor="name"
            >
              Community Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter community name"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2 dark:text-gray-300"
              htmlFor="category"
            >
              Choose a Topic
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              This will help people find your community in topic categories
            </p>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 font-bold mb-2 dark:text-gray-300"
              htmlFor="description"
            >
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              placeholder="Describe what your community is about"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 dark:text-gray-300">
              Community Image (Optional)
            </label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              bucketName="communities"
              folderPath={`community-images/{timestamp}`}
              buttonLabel="Upload Community Image"
              showPreview={true}
              maxSize={2}
              className="w-full"
            />
            {imageUrl && (
              <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                Image uploaded successfully!
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
