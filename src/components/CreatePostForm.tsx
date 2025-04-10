// src/components/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// This function only handles creating posts in the public_articles table
// It doesn't affect the saveDraft functionality
async function createPublicArticle(
  content: string,
  title: string,
  category?: string
) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to create an article");
    }

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");

    // Create an excerpt from the content (first 150 characters)
    const excerpt =
      content.substring(0, 150) + (content.length > 150 ? "..." : "");

    // Insert into public_articles instead of posts
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .insert({
        user_id: userData.user.id,
        title,
        content,
        excerpt,
        category: category || "general", // Default category if none provided
        slug,
        is_published: true,
        published_at: new Date().toISOString(),
        view_count: 0,
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
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
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
      await createPublicArticle(content, title, category || undefined);

      setContent("");
      setTitle("");
      setCategory("");
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Create a New Post</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Post created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Add a title to your post"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Category (Optional)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a category</option>
            <option value="ancient-history">Ancient History</option>
            <option value="medieval-period">Medieval Period</option>
            <option value="renaissance">Renaissance</option>
            <option value="early-modern-period">Early Modern Period</option>
            <option value="industrial-age">Industrial Age</option>
            <option value="20th-century">20th Century</option>
            <option value="world-wars">World Wars</option>
            <option value="cold-war-era">Cold War Era</option>
            <option value="modern-history">Modern History</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Write your post content..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
