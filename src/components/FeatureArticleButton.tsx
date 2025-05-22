// src/components/FeatureArticleButton.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

// ADMIN_USER_ID constant
const ADMIN_USER_ID = "3b398d8a-11de-4066-a7d6-091c21647ecb";

interface FeatureArticleButtonProps {
  articleId: string;
}

export default function FeatureArticleButton({
  articleId,
}: FeatureArticleButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Only render for admin users
  if (!user || user.id !== ADMIN_USER_ID) {
    return null;
  }

  const handleFeature = async (position: number) => {
    try {
      setLoading(true);
      setMessage(null);
      setDebugInfo(null);

      if (!articleId || articleId.trim() === "") {
        setMessage("Invalid article ID");
        setDebugInfo(`Article ID is empty or invalid: "${articleId}"`);
        setLoading(false);
        return;
      }

      console.log(
        `Attempting to feature article ${articleId} at position ${position}`
      );

      // Log the values we're trying to insert
      const insertData = {
        article_id: articleId,
        position: position,
      };
      console.log("Attempting to insert:", insertData);

      const { data: existing, error: existingError } = await (supabase as any)
        .from("featured_articles")
        .select("id")
        .eq("position", position)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing article:", existingError);
        setDebugInfo(
          `Check error: ${existingError.message} (${existingError.code})`
        );
      }

      console.log("Existing at position:", existing);

      // If position is occupied, delete the existing entry
      if (existing) {
        console.log(`Removing existing article at position ${position}`);
        const { error: deleteError } = await (supabase as any)
          .from("featured_articles")
          .delete()
          .eq("position", position);

        if (deleteError) {
          console.error(
            "Error deleting existing featured article:",
            deleteError
          );
          setDebugInfo(
            `Delete error: ${deleteError.message} (${deleteError.code})`
          );
          throw new Error(
            `Database error during delete: ${deleteError.message}`
          );
        }
      }

      // Insert the new featured article
      const { data, error: insertError } = await (supabase as any)
        .from("featured_articles")
        .insert({
          article_id: articleId,
          position: position,
        })
        .select();

      if (insertError) {
        console.error("Error inserting featured article:", insertError);
        setDebugInfo(
          `Insert error: ${insertError.message} (${insertError.code})`
        );
        throw new Error(`Database error during insert: ${insertError.message}`);
      }

      console.log("Insert result:", data);

      // Verify the insert worked by fetching all featured articles
      const { data: allFeatured, error: fetchError } = await (supabase as any)
        .from("featured_articles")
        .select("*");

      console.log("All featured articles after insert:", allFeatured);
      if (fetchError) {
        console.error("Error fetching all featured articles:", fetchError);
      }

      setMessage(`Article featured in position ${position}!`);
      setDebugInfo(
        `Success! Featured article ID: ${articleId} at position ${position}`
      );

      // Force a refresh of the page after a delay
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 2000);
    } catch (error: any) {
      console.error("Error featuring article:", error);
      setMessage(
        "Failed to feature article: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="text-center">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          {loading ? "Processing..." : "Feature This Article"}
        </button>

        {message && (
          <div
            className={`mt-2 p-2 rounded ${
              message.includes("Failed")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-100 text-gray-700 text-sm rounded">
            Debug: {debugInfo}
          </div>
        )}

        {showOptions && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((position) => (
              <button
                key={position}
                onClick={() => handleFeature(position)}
                disabled={loading}
                className={`p-2 ${
                  position === 3 ? "bg-red-600" : "bg-gray-600"
                } text-white rounded hover:opacity-90`}
              >
                {position === 3 ? "Feature (Mid)" : `Position ${position}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
