"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const [userId, setUserId] = useState<string>("");
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
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

  async function checkTables() {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    const data: any = {};

    try {
      // Check drafts table
      try {
        const { data: drafts, error: draftsError } = await (supabase as any)
          .from("drafts")
          .select("*")
          .eq("user_id", userId);

        data.drafts = {
          count: drafts?.length || 0,
          error: draftsError?.message || null,
        };
      } catch (e: any) {
        data.drafts = {
          count: 0,
          error: e.message,
        };
      }

      // Check public_articles table
      try {
        const { data: articles, error: articlesError } = await (supabase as any)
          .from("public_articles")
          .select("*")
          .eq("user_id", userId);

        data.public_articles = {
          count: articles?.length || 0,
          error: articlesError?.message || null,
        };
      } catch (e: any) {
        data.public_articles = {
          count: 0,
          error: e.message,
        };
      }

      // Check posts table (if it exists)
      try {
        const { data: posts, error: postsError } = await (supabase as any)
          .from("posts")
          .select("*")
          .eq("user_id", userId);

        data.posts = {
          count: posts?.length || 0,
          error: postsError?.message || null,
        };
      } catch (e: any) {
        data.posts = {
          count: 0,
          error: e.message,
        };
      }

      setResults(data);
    } catch (error: any) {
      setError("Error checking tables: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>

      <div className="mb-6">
        <label className="block mb-2">Your User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter user ID"
        />
        <div className="text-xs text-gray-500 mt-1">
          Current logged in user ID is auto-filled if available
        </div>
      </div>

      <button
        onClick={checkTables}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Tables"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-bold mb-4">Results for User ID: {userId}</h2>

          <div className="space-y-4">
            {Object.entries(results).map(([tableName, data]: [string, any]) => (
              <div key={tableName} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{tableName}</h3>
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      data.error
                        ? "bg-red-100 text-red-800"
                        : data.count > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100"
                    }`}
                  >
                    {data.error ? "Error" : `${data.count} entries`}
                  </span>
                </div>

                {data.error && (
                  <div className="text-red-600 text-sm mt-2">
                    Error: {data.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
