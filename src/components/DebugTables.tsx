// src/components/DebugTables.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function DebugTables() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      checkTables();
    }
  }, [user]);

  async function checkTables() {
    if (!user) return;

    setLoading(true);
    setError(null);
    const results: any = {};

    try {
      // Check drafts table
      try {
        const { data: drafts, error: draftsError } = await (supabase as any)
          .from("drafts")
          .select("*")
          .eq("user_id", user.id);

        results.drafts = {
          count: drafts?.length || 0,
          error: draftsError?.message || null,
          sample: drafts?.length > 0 ? drafts[0] : null,
        };
      } catch (e: any) {
        results.drafts = {
          count: 0,
          error: e.message,
          sample: null,
        };
      }

      // Check public_articles table
      try {
        const { data: articles, error: articlesError } = await (supabase as any)
          .from("public_articles")
          .select("*")
          .eq("user_id", user.id);

        results.public_articles = {
          count: articles?.length || 0,
          error: articlesError?.message || null,
          sample: articles?.length > 0 ? articles[0] : null,
        };
      } catch (e: any) {
        results.public_articles = {
          count: 0,
          error: e.message,
          sample: null,
        };
      }

      // Check posts table (if it exists)
      try {
        const { data: posts, error: postsError } = await (supabase as any)
          .from("posts")
          .select("*")
          .eq("user_id", user.id);

        results.posts = {
          count: posts?.length || 0,
          error: postsError?.message || null,
          sample: posts?.length > 0 ? posts[0] : null,
        };
      } catch (e: any) {
        results.posts = {
          count: 0,
          error: e.message,
          sample: null,
        };
      }

      setTables(results);
    } catch (error: any) {
      setError("Error checking tables: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        Please log in to debug tables
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Database Tables Debug</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={checkTables}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(tables).map(([tableName, data]: [string, any]) => (
            <div key={tableName} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{tableName}</h3>
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

              {showDetails && data.count > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold mb-1">Sample Data:</div>
                  <pre className="bg-gray-100 p-2 text-xs overflow-x-auto rounded">
                    {JSON.stringify(data.sample, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">User ID: {user.id}</div>
    </div>
  );
}
