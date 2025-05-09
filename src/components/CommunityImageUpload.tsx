// src/components/CommunityImageUpload.tsx - This is a new component we'll create

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface CommunityImageUploadProps {
  communityId: string;
  type: "banner" | "profile"; // Two types of uploads
  currentImageUrl: string | null;
  onImageUpdated: (url: string) => void;
  isAdmin: boolean;
}

export default function CommunityImageUpload({
  communityId,
  type,
  currentImageUrl,
  onImageUpdated,
  isAdmin,
}: CommunityImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !isAdmin) {
      setError("You must be an admin to change the community images");
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const fileSize = file.size / 1024 / 1024; // Convert to MB

    // Check file size (limit to 2MB)
    if (fileSize > 2) {
      setError("File size exceeds 2MB limit");
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);

    try {
      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `communities/${communityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("communities")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("communities")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update the community in the database
      const updateField = type === "banner" ? "banner_url" : "image_url";
      const { error: updateError } = await (supabase as any)
        .from("communities")
        .update({ [updateField]: publicUrl })
        .eq("id", communityId);

      if (updateError) throw updateError;

      // Notify the parent component
      onImageUpdated(publicUrl);
    } catch (err: any) {
      console.error(`Error uploading ${type}:`, err);
      setError(err.message || `Failed to upload ${type}`);
      setPreview(currentImageUrl); // Reset preview on error
    } finally {
      setUploading(false);
    }
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative">
      {/* Image Display */}
      <div
        className={`${
          type === "banner" ? "h-40 w-full" : "h-16 w-16 rounded-full"
        } relative overflow-hidden`}
      >
        {preview ? (
          <img
            src={preview}
            alt={`Community ${type}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${
              type === "banner"
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : ""
            }`}
          >
            {type === "profile" && (
              <span className="text-2xl font-bold text-white">?</span>
            )}
          </div>
        )}

        {/* Admin Edit Overlay */}
        <label
          htmlFor={`${type}-upload-${communityId}`}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {uploading ? `Uploading ${type}...` : `Change ${type}`}
          </div>
        </label>

        {/* Hidden File Input */}
        <input
          id={`${type}-upload-${communityId}`}
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm rounded mt-2 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
