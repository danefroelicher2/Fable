// src/app/articles/[slug]/edit/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";

export default function EditArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Scroll to top when message or error is shown
  useEffect(() => {
    if ((message || error) && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message, error]);

  // Fetch the article to edit
  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  async function fetchArticle() {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching article with slug:", slug);

      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        setError("Article not found or has been removed.");
        return;
      }

      // Check if current user is the author
      if (!user || data.user_id !== user.id) {
        setError("You don't have permission to edit this article.");
        return;
      }

      console.log("Article found:", data);
      setArticle(data);
      setTitle(data.title || "");
      setContent(data.content || "");
      setCoverImage(data.image_url || "");
      setCategory(data.category || "");
    } catch (error) {
      console.error("Error in article fetch flow:", error);
      setError("An error occurred while loading the article.");
    } finally {
      setLoading(false);
    }
  }

  // If user is not signed in, show sign-in prompt
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">Edit Article</h1>
          <p className="mb-6">
            You need to sign in to edit articles on LOSTLIBRARY.
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent(
              `/articles/${slug}/edit`
            )}`}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    if (!title.trim()) {
      setError("Please enter a title before saving");
      return;
    }

    // Add character limit validation
    if (title.length > 40) {
      setError("Title must be 40 characters or fewer");
      return;
    }

    if (!content.trim()) {
      setError("Please enter content before saving");
      return;
    }

    if (!category.trim()) {
      setError("Please select a category before saving");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      // Auto-generate excerpt from content
      const autoExcerpt =
        content.length > 150 ? content.substring(0, 150) + "..." : content;

      // Update the article in the database
      const updates = {
        title,
        content,
        excerpt: autoExcerpt,
        category,
        image_url: coverImage,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("public_articles")
        .update(updates)
        .eq("id", article.id);

      if (error) throw error;

      setMessage("Article updated successfully! Redirecting...");

      // Redirect back to the article after a delay
      setTimeout(() => {
        router.push(`/articles/${article.slug}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error updating article:", error);
      setError("Error updating article: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading article...</span>
        </div>
      </div>
    );
  }

  // Error state (no article found or no permission)
  if (error && !article) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </Link>
            {slug && (
              <Link
                href={`/articles/${slug}`}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Back to Article
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <Link
            href={`/articles/${article.slug}`}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </Link>
        </div>

        <div ref={messageRef}>
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

        <form className="bg-white p-6 rounded-lg shadow-md">
          {/* 1. Title */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="title"
                className="block text-gray-700 font-medium"
              >
                Title
              </label>
              <div
                className={`text-sm ${
                  title.length > 40
                    ? "text-red-600 font-bold"
                    : title.length > 35
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {title.length}/40
              </div>
            </div>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 text-black ${
                title.length > 40
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              placeholder="Enter a compelling title for your article"
              required
              disabled={isSaving}
              maxLength={50}
            />
            {title.length > 40 && (
              <p className="text-red-600 text-sm mt-1">
                Title must be 40 characters or fewer
              </p>
            )}
          </div>

          {/* 2. Cover Image */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Cover Image
            </label>
            <div className="flex flex-col md:flex-row md:items-start">
              {coverImage && (
                <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-auto rounded border border-gray-200"
                  />
                </div>
              )}
              <div className={coverImage ? "md:w-2/3" : "w-full"}>
                {!isSaving ? (
                  <ImageUpload
                    onImageUploaded={(url) => setCoverImage(url)}
                    bucketName="article-images"
                    folderPath="{userId}/covers/{timestamp}"
                    buttonLabel="Update Cover Image"
                    acceptedTypes="image/jpeg,image/png,image/webp"
                    maxSize={2}
                    showPreview={false}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="bg-gray-300 text-gray-600 px-4 py-2 rounded opacity-50 cursor-not-allowed"
                  >
                    Update Cover Image
                  </button>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  Upload a new cover image if you want to change it (max 2MB,
                  JPEG or PNG)
                </p>
              </div>
            </div>
          </div>

          {/* 3. Category */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              required
              disabled={isSaving}
            >
              <option value="">Select a category</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
            </select>
          </div>

          {/* 4. Content */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="content"
                className="block text-gray-700 font-medium"
              >
                Content
              </label>
            </div>

            <textarea
              id="content"
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              rows={15}
              placeholder="Write your article here..."
              required
              disabled={isSaving}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/articles/${article.slug}`}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
