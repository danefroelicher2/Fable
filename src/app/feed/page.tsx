// src/app/feed/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function PublicFeed() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    checkDatabaseAccess();
    fetchArticles();
  }, [selectedCategory]);

  async function checkDatabaseAccess() {
    try {
      // Check if public_articles table exists and is accessible
      const { data: tableData, error: tableError } = await (supabase as any)
        .from("public_articles")
        .select("count()", { count: "exact", head: true });

      console.log("Table check result:", tableData, tableError);

      // Try a simple query with minimal restrictions
      const { data: simpleData, error: simpleError } = await (supabase as any)
        .from("public_articles")
        .select("id")
        .limit(1);

      console.log("Simple query result:", simpleData, simpleError);
    } catch (error) {
      console.error("Database access check error:", error);
    }
  }

  // src/app/feed/page.tsx - Update the fetchArticles function
  async function fetchArticles() {
    setLoading(true);

    try {
      console.log("Fetching articles with category:", selectedCategory);

      let query = (supabase as any)
        .from("public_articles")
        .select(`*`) // Just select all fields from the article for now
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Articles fetched:", data?.length || 0, data);
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  // Categories matching your existing ones
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "ancient-history", label: "Ancient History" },
    { value: "medieval-period", label: "Medieval Period" },
    { value: "renaissance", label: "Renaissance" },
    { value: "early-modern-period", label: "Early Modern Period" },
    { value: "industrial-age", label: "Industrial Age" },
    { value: "20th-century", label: "20th Century" },
    { value: "world-wars", label: "World Wars" },
    { value: "cold-war-era", label: "Cold War Era" },
    { value: "modern-history", label: "Modern History" },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Community Articles</h1>

      {/* Category Filter */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">
            No articles found in this category.
          </p>
          {user && (
            <Link
              href="/write"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Write the First Article
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden article-card"
            >
              <div className="h-48 bg-slate-200 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  [Featured Image: {article.title}]
                </div>
              </div>
              <div className="p-4">
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                    {article.title}
                  </h2>
                </Link>
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                    U
                  </div>
                  <span className="text-sm text-gray-600">Author</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mb-3">{article.excerpt}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {categories.find((c) => c.value === article.category)
                      ?.label || article.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
