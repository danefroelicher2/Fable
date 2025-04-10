"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPublish() {
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("Test Article");
  const [content, setContent] = useState("This is a test article");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current user on load
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    }
    getCurrentUser();
  }, []);

  async function publishDirectly() {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Generate a slug
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");

      // Generate excerpt
      const excerpt =
        content.length > 150 ? content.substring(0, 150) + "..." : content;

      // Insert into public_articles table
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .insert({
          user_id: userId,
          title,
          content,
          excerpt,
          category,
          slug,
          is_published: true,
          published_at: new Date().toISOString(),
          view_count: 0,
        })
        .select();

      if (error) throw error;

      setResult(data);
    } catch (error: any) {
      setError("Error publishing: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Test Direct Publishing</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block mb-2">User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter user ID"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={publishDirectly}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish Directly"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Successfully published!</p>
          <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
