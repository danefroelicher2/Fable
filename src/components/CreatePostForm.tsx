// src/components/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

async function createPublicArticle(
  content: string,
  title: string,
  imageUrl?: string | null
) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to create an article");
    }

    // Auto-generate these values
    const slug =
      title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-6);

    const excerpt =
      content.substring(0, 150) + (content.length > 150 ? "..." : "");

    // Insert into public_articles table
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .insert({
        user_id: userData.user.id,
        title,
        content,
        excerpt: excerpt,
        category: "general", // Default category
        slug,
        is_published: true,
        published_at: new Date().toISOString(),
        view_count: 0,
        image_url: imageUrl,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating article:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error in createPublicArticle:", err);
    throw err;
  }
}

export default function CreatePostForm({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPublicArticle(content, title, coverImage);

      // Reset form
      setTitle("");
      setContent("");
      setCoverImage(null);
      setSuccess(true);

      // Call the callback if provided
      if (onPostCreated) {
        onPostCreated();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Mock function for the upload cover image button
  const handleImageUpload = () => {
    // In a real implementation, this would open a file picker or similar
    // For now, just setting a placeholder image URL
    setCoverImage("https://via.placeholder.com/800x400");
    // You would normally handle file upload to Supabase storage here
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Write a New Article
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Article published successfully!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a compelling title for your article"
            required
          />
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-gray-700 mb-2">
            Cover Image
          </label>
          <button
            type="button"
            onClick={handleImageUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Cover Image
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Upload an eye-catching cover image for your article (max 2MB, JPEG
            or PNG)
          </p>

          {coverImage && (
            <div className="mt-2">
              <img
                src={coverImage}
                alt="Cover preview"
                className="max-h-40 rounded border"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-gray-700">
              Content
            </label>
            <div className="space-x-2">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setContent(content + "**bold text**");
                }}
              >
                Bold
              </button>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setContent(content + "*italic text*");
                }}
              >
                Italic
              </button>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setContent(content + "\n## Heading\n");
                }}
              >
                Heading
              </button>
            </div>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded min-h-[200px]"
            placeholder="Write your article content here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </form>
    </div>
  );
}
