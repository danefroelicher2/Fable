// src/app/profile/drafts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getUserDrafts,
  deleteDraft,
  Draft,
  publishDraft,
} from "@/lib/draftUtils";

export default function DraftsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Protected route check - improved redirect logic
  useEffect(() => {
    // Only check once the auth state is no longer loading
    if (!authLoading) {
      if (!user) {
        // Redirect immediately if user is not authenticated
        router.replace(
          "/signin?redirect=" + encodeURIComponent("/profile/drafts")
        );
      } else {
        // If user is authenticated, fetch drafts
        fetchDrafts();
      }
    }
  }, [user, router, authLoading]);

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      const userDrafts = await getUserDrafts();

      if (userDrafts) {
        setDrafts(userDrafts);
      } else {
        setError("Failed to load drafts");
      }
    } catch (err) {
      console.error("Error fetching drafts:", err);
      setError("An error occurred while loading drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!id) return;

    try {
      const success = await deleteDraft(id);

      if (success) {
        // Remove the draft from the list
        setDrafts(drafts.filter((draft) => draft.id !== id));
        setDeleteConfirm(null);

        // Show success message
        setMessage("Draft deleted successfully");
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError("Failed to delete draft");
      }
    } catch (err) {
      console.error("Error deleting draft:", err);
      setError("An error occurred while deleting the draft");
    }
  };

  const handleEditDraft = (draft: Draft) => {
    // Store draft in localStorage temporarily (you could also use URL params)
    localStorage.setItem("editDraft", JSON.stringify(draft));
    router.push(`/write/edit/${draft.id}`);
  };

  const handlePublishDraft = async (draft: Draft) => {
    if (!draft.id) return;

    try {
      setPublishingId(draft.id);

      // Check if draft has required fields
      if (!draft.title || !draft.title.trim()) {
        setError("Draft must have a title to publish");
        return;
      }

      if (!draft.content || !draft.content.trim()) {
        setError("Draft must have content to publish");
        return;
      }

      // Publish the draft
      const publishedId = await publishDraft(draft);

      if (publishedId) {
        // Remove the draft from the list since it's now published
        setDrafts(drafts.filter((d) => d.id !== draft.id));

        // Show success message
        setMessage("Draft published successfully!");

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
          // Optionally, navigate to the published article
          router.push(`/articles/${draft.slug || publishedId}`);
        }, 3000);
      } else {
        setError("Failed to publish draft");
      }
    } catch (err) {
      console.error("Error publishing draft:", err);
      setError("An error occurred while publishing the draft");
    } finally {
      setPublishingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state while checking authentication or loading drafts
  if (authLoading || (loading && user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  // If not authenticated, we'll be redirected in useEffect
  // This is a fallback in case the redirect hasn't happened yet
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your drafts</p>
          <Link
            href={`/signin?redirect=${encodeURIComponent("/profile/drafts")}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Saved Drafts</h1>
          <Link
            href="/write"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Write New Article
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-xl mb-4">You don't have any saved drafts yet.</p>
            <p className="mb-6">
              Start writing and save your work as drafts to continue later.
            </p>
            <Link
              href="/write"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drafts.map((draft) => (
                    <tr key={draft.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {draft.title || "Untitled Draft"}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {draft.excerpt
                            ? draft.excerpt.length > 60
                              ? draft.excerpt.substring(0, 60) + "..."
                              : draft.excerpt
                            : "No excerpt"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {draft.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(draft.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {deleteConfirm === draft.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDeleteDraft(draft.id as string)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEditDraft(draft)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handlePublishDraft(draft)}
                              disabled={publishingId === draft.id}
                              className={`text-green-600 hover:text-green-900 ${
                                publishingId === draft.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {publishingId === draft.id
                                ? "Publishing..."
                                : "Publish"}
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm(draft.id as string)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
