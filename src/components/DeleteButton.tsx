// src/components/DeleteButton.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface DeleteButtonProps {
  articleId: string;
  onDelete?: () => void;
  className?: string;
}

export default function DeleteButton({
  articleId,
  onDelete,
  className = "",
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setIsConfirming(true);
  };

  const handleCancelDelete = () => {
    setIsConfirming(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      // Delete the article from the database
      const { error } = await (supabase as any)
        .from("public_articles")
        .delete()
        .eq("id", articleId);

      if (error) {
        throw error;
      }

      // If there's an onDelete callback, call it
      if (onDelete) {
        onDelete();
      }
    } catch (err: any) {
      console.error("Error deleting article:", err);
      setError(err.message || "Failed to delete article");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isConfirming) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-red-600">Are you sure?</span>
        <button
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          className="text-white bg-red-600 hover:bg-red-700 text-xs px-3 py-1 rounded disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Yes, Delete"}
        </button>
        <button
          onClick={handleCancelDelete}
          disabled={isDeleting}
          className="text-gray-600 bg-gray-200 hover:bg-gray-300 text-xs px-3 py-1 rounded disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className={`text-red-600 hover:text-red-800 text-sm ${className}`}
      >
        Delete Article
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </>
  );
}
