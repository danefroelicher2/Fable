// src/app/write/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { getDraftById, saveDraft, Draft } from "@/lib/draftUtils";

export default function EditDraftPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDraft = async () => {
      if (!user || !draftId) return;

      try {
        // Try to get draft from localStorage first (if coming from drafts list)
        const storedDraft = localStorage.getItem("editDraft");
        if (storedDraft) {
          const parsedDraft = JSON.parse(storedDraft);
          setDraft(parsedDraft);
          setTitle(parsedDraft.title || "");
          setContent(parsedDraft.content || "");
          setExcerpt(parsedDraft.excerpt || "");
          setCategory(parsedDraft.category || "");

          // Clear localStorage after loading
          localStorage.removeItem("editDraft");
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const fetchedDraft = await getDraftById(draftId);

        if (fetchedDraft) {
          setDraft(fetchedDraft);
          setTitle(fetchedDraft.title || "");
          setContent(fetchedDraft.content || "");
          setExcerpt(fetchedDraft.excerpt || "");
          setCategory(fetchedDraft.category || "");
        } else {
          setError("Draft not found or you don't have permission to edit it");
        }
      } catch (err) {
        console.error("Error fetching draft:", err);
        setError("An error occurred while loading the draft");
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, [user, draftId]);

  // If user is not signed in, show sign-in prompt
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">Edit Draft</h1>
          <p className="mb-6">
            You need to sign in to edit drafts on LOSTLIBRARY.
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent(
              `/write/edit/${draftId}`
            )}`}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateDraft = async () => {
    if (!title.trim()) {
      setSaveMessage("Please enter a title before saving");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      if (!draft || !draft.id) {
        throw new Error("Draft not found");
      }

      const updatedDraft: Draft = {
        ...draft,
        title,
        content,
        excerpt,
        category,
      };

      const savedDraft = await saveDraft(updatedDraft);

      if (savedDraft) {
        setSaveMessage("Draft updated successfully!");
        setDraft(savedDraft);

        // Clear message after a delay
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      } else {
        setSaveMessage("Failed to update draft. Please try again.");
      }
    } catch (error) {
      console.error("Error updating draft:", error);
      setSaveMessage("An error occurred while updating draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // This would handle publishing logic
    alert("Publishing functionality will be implemented soon!");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/profile/drafts"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Drafts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Draft</h1>
          <Link
            href="/profile/drafts"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Drafts
          </Link>
        </div>

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
              required
            />
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
              onClick={handleUpdateDraft}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update Draft"}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
