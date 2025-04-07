// src/app/write/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { saveDraft, Draft } from "@/lib/draftUtils";
import { supabase } from "@/lib/supabase";

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // If user is not signed in, show sign-in prompt
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">Write an Article</h1>
          <p className="mb-6">
            You need to sign in to write articles on LOSTLIBRARY.
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent("/write")}`}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setSaveMessage("Please enter a title before saving");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const draftData: Draft = {
        title,
        content,
        excerpt,
        category,
      };

      const savedDraft = await saveDraft(draftData);

      if (savedDraft) {
        setSaveMessage("Draft saved successfully!");

        // Optionally, redirect to drafts page after a delay
        setTimeout(() => {
          setSaveMessage("");
          // Uncomment the line below if you want to redirect after saving
          // router.push("/profile/drafts");
        }, 3000);
      } else {
        setSaveMessage("Failed to save draft. Please try again.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      setSaveMessage("An error occurred while saving draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setSaveMessage(
        "Please fill in title, content, and select a category before publishing"
      );
      return;
    }

    setIsPublishing(true);
    setSaveMessage("");

    try {
      // Generate a URL-friendly slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");

      // Use excerpt or generate one from content if not provided
      const finalExcerpt =
        excerpt ||
        (content.length > 150 ? content.substring(0, 150) + "..." : content);

      console.log("Publishing article with data:", {
        user_id: user.id,
        title,
        slug,
        category,
        is_published: true,
      });

      // Insert the article into the public_articles table
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .insert({
          user_id: user.id,
          title,
          content,
          excerpt: finalExcerpt,
          category,
          slug,
          is_published: true,
          published_at: new Date().toISOString(),
          view_count: 0,
        });

      if (error) {
        console.error("Database error during publish:", error);
        throw error;
      }

      console.log("Published article:", data);
      setSaveMessage("Article published successfully!");

      // Redirect to the feed page
      setTimeout(() => {
        router.push("/feed");
      }, 1500);
    } catch (error) {
      console.error("Error publishing article:", error);
      setSaveMessage(
        "An error occurred while publishing your article. Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Write a New Article</h1>

        {saveMessage && (
          <div
            className={`p-4 mb-6 rounded-md ${
              saveMessage.includes("Failed") || saveMessage.includes("error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {saveMessage}
          </div>
        )}

        <form className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter a compelling title for your article"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="excerpt"
              className="block text-gray-700 font-medium mb-2"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Provide a brief summary of your article (will appear in previews)"
            />
            <p className="text-gray-500 text-sm mt-1">
              If left empty, an excerpt will be automatically generated from the
              first part of your content.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
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

          <div className="mb-8">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={15}
              placeholder="Write your article here..."
              required
            />
            <p className="text-gray-500 text-sm mt-2">
              Tip: Use Markdown for formatting. *italic* for italics, **bold**
              for bold, # for headings.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
