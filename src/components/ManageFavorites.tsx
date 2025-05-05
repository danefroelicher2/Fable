// src/components/ManageFavorites.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string;
  is_favorite: boolean;
}

export default function ManageFavorites() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // This will hold the IDs of the selected favorite articles
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserArticles();
      // Also load current favorites from localStorage
      const savedFavorites = localStorage.getItem(`userFavorites_${user.id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Error parsing favorites:", e);
        }
      }
    }
  }, [user]);

  async function fetchUserArticles() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user's published articles
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id, 
          title, 
          slug, 
          excerpt,
          image_url,
          published_at
        `
        )
        .eq("user_id", user.id)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Get favorites from localStorage
      const savedFavorites = localStorage.getItem(`userFavorites_${user.id}`);
      let favoriteIds: string[] = [];

      if (savedFavorites) {
        try {
          favoriteIds = JSON.parse(savedFavorites);
          setFavorites(favoriteIds);
        } catch (e) {
          console.error("Error parsing favorites:", e);
        }
      }

      // Mark favorite articles
      const articlesWithFavorites = (data || []).map((article: any) => ({
        ...article,
        is_favorite: favoriteIds.includes(article.id),
      }));

      setArticles(articlesWithFavorites);
    } catch (err) {
      console.error("Error fetching user articles:", err);
      setError("Failed to load your articles");
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = (articleId: string) => {
    // Update the local state first
    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.id === articleId) {
          return { ...article, is_favorite: !article.is_favorite };
        }
        return article;
      })
    );

    // Update favorites list
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(articleId)) {
        return prevFavorites.filter((id) => id !== articleId);
      } else {
        // Only allow 4 favorites maximum
        if (prevFavorites.length >= 4) {
          // Show error message if trying to add more than 4
          setError("You can only select up to 4 favorite articles");
          // Keep the article not favorited in UI
          setArticles((prevArticles) =>
            prevArticles.map((article) => {
              if (article.id === articleId) {
                return { ...article, is_favorite: false };
              }
              return article;
            })
          );
          return prevFavorites;
        }
        return [...prevFavorites, articleId];
      }
    });
  };

  const saveFavorites = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // In a complete implementation, you would save to a database table
      // For now, we'll use localStorage as a proof of concept
      localStorage.setItem(
        `userFavorites_${user.id}`,
        JSON.stringify(favorites)
      );

      setMessage("Favorites saved successfully!");

      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving favorites:", err);
      setError("Failed to save favorites");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-200 h-16 rounded"></div>
        ))}
      </div>
    );
  }

  if (error && !message) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-700">
          You don't have any published articles yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {message}
        </div>
      )}

      {error && message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          Select up to 4 articles to showcase as your favorites. These will
          appear in a prominent grid at the top of your profile.
        </p>
        <p className="text-sm text-gray-500">Selected: {favorites.length}/4</p>
      </div>

      <div className="space-y-2">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`border p-4 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
              article.is_favorite
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => toggleFavorite(article.id)}
          >
            <div className="flex items-center space-x-3">
              {article.image_url ? (
                <div className="w-12 h-12 rounded overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  <span>No img</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={article.is_favorite}
                onChange={() => {}} // Handled by the div click
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={saveFavorites}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Favorites"}
        </button>
      </div>
    </div>
  );
}
