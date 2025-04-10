// src/app/debug/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfileDebugPage() {
  const { user, session, isLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // Debug info collection
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfileData(data);
      } catch (error: any) {
        console.error("Profile fetch error:", error);
        setDbError(`Profile fetch error: ${error.message}`);
      }
    };

    fetchProfileData();
  }, [user]);

  // Function to check published articles
  const checkPublishedArticles = async () => {
    setIsCheckingDb(true);
    setDbError(null);

    try {
      if (!user) throw new Error("No user authenticated");

      // Check if the table exists first
      const { data: tableCheck, error: tableError } = await (supabase as any)
        .from("public_articles")
        .select("count(*)", { count: "exact", head: true });

      if (tableError) {
        if (tableError.code === "PGRST116") {
          throw new Error(
            "The public_articles table does not exist in your database"
          );
        }
        throw tableError;
      }

      // Now try to get the user's articles
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id, 
          title, 
          slug, 
          published_at, 
          view_count,
          is_published
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      setArticles(data || []);
    } catch (error: any) {
      console.error("Database check error:", error);
      setDbError(`Database check error: ${error.message}`);
    } finally {
      setIsCheckingDb(false);
    }
  };

  // Create a test article
  const createTestArticle = async () => {
    setIsCheckingDb(true);
    setDbError(null);

    try {
      if (!user) throw new Error("No user authenticated");

      const testSlug = `test-article-${Date.now()}`;
      const articleData = {
        user_id: user.id,
        title: `Test Article ${new Date().toLocaleTimeString()}`,
        content: "This is a test article created from the diagnostic tool.",
        excerpt: "Test article excerpt",
        category: "test-category",
        slug: testSlug,
        is_published: true,
        published_at: new Date().toISOString(),
        view_count: 0,
      };

      // Insert the test article
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .insert(articleData)
        .select();

      if (error) throw error;

      await checkPublishedArticles();

      return data;
    } catch (error: any) {
      console.error("Test article creation error:", error);
      setDbError(`Test article creation error: ${error.message}`);
    } finally {
      setIsCheckingDb(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Diagnostics</h1>

      {/* Auth Debug Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Authentication Status</h2>

        {isLoading ? (
          <p className="text-gray-600">Loading authentication state...</p>
        ) : user ? (
          <div>
            <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
              ✅ User is authenticated
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 border border-gray-200">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">User ID:</td>
                    <td className="px-4 py-2 font-mono text-sm">{user.id}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Email:</td>
                    <td className="px-4 py-2">{user.email}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Session Valid:</td>
                    <td className="px-4 py-2">{session ? "Yes" : "No"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              ❌ User is NOT authenticated
            </div>
            <p className="mb-4">
              You need to sign in to debug profile functionality.
            </p>
            <Link
              href="/signin"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Profile Data Section */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Data</h2>

          {profileData ? (
            <div>
              <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                ✅ Profile data retrieved successfully
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-50 border border-gray-200">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">Username:</td>
                      <td className="px-4 py-2">
                        {profileData.username || "Not set"}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">Full Name:</td>
                      <td className="px-4 py-2">
                        {profileData.full_name || "Not set"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Avatar URL:</td>
                      <td className="px-4 py-2">
                        {profileData.avatar_url || "Not set"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : dbError ? (
            <div className="bg-red-100 text-red-800 p-3 rounded">
              ❌ Error retrieving profile data: {dbError}
            </div>
          ) : (
            <p className="text-gray-600">Loading profile data...</p>
          )}
        </div>
      )}

      {/* Published Articles Check */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Published Articles</h2>

          <div className="mb-4 flex space-x-4">
            <button
              onClick={checkPublishedArticles}
              disabled={isCheckingDb}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isCheckingDb ? "Checking..." : "Check Published Articles"}
            </button>

            <button
              onClick={createTestArticle}
              disabled={isCheckingDb}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {isCheckingDb ? "Creating..." : "Create Test Article"}
            </button>
          </div>

          {dbError && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              ❌ Error: {dbError}
            </div>
          )}

          {articles.length > 0 ? (
            <div>
              <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                ✅ Found {articles.length} published article(s)
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-4 py-2">{article.title}</td>
                        <td className="px-4 py-2">{article.slug}</td>
                        <td className="px-4 py-2">
                          {new Date(article.published_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-blue-600 hover:text-blue-800"
                            target="_blank"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : articles.length === 0 && !dbError && !isCheckingDb ? (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded">
              ⚠️ No published articles found for this user
            </div>
          ) : null}
        </div>
      )}

      {/* Navigation Links */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Navigation Tests</h2>

        <div className="space-y-2">
          <div>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              → Go to Your Profile Page
            </Link>
            <span className="text-gray-500 ml-2">
              (Tests the main profile page)
            </span>
          </div>

          {user && (
            <div>
              <Link
                href={`/profile/${user.id}/articles`}
                className="text-blue-600 hover:text-blue-800"
              >
                → Go to Your Articles Page
              </Link>
              <span className="text-gray-500 ml-2">
                (Tests the articles display page)
              </span>
            </div>
          )}

          <div>
            <Link href="/feed" className="text-blue-600 hover:text-blue-800">
              → Go to Community Feed
            </Link>
            <span className="text-gray-500 ml-2">
              (Tests the article feed display)
            </span>
          </div>
        </div>
      </div>

      {/* Console Log Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>

        <div className="prose max-w-none">
          <h3>If you're experiencing redirect loops:</h3>
          <ol>
            <li>
              Check your browser's console for errors (F12 or right-click +
              Inspect)
            </li>
            <li>
              Look for network requests and see where redirects are happening
            </li>
            <li>
              If your profile page is redirecting to /not-found, it means
              either:
              <ul>
                <li>
                  The user ID in the URL doesn't match the authenticated user
                </li>
                <li>There's an error in the routing or authentication logic</li>
                <li>
                  The protected route middleware is redirecting incorrectly
                </li>
              </ul>
            </li>
          </ol>

          <h3>
            If authentication seems to be working but content doesn't display:
          </h3>
          <ol>
            <li>
              Use this diagnostic page to check if articles exist in the
              database
            </li>
            <li>
              Create a test article and try viewing it through the normal routes
            </li>
            <li>
              Check if the Supabase RLS policies allow reading the articles
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
