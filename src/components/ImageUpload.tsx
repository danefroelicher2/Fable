// src/components/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
  className?: string;
  buttonLabel?: string;
  showPreview?: boolean;
  existingImageUrl?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string;
}

export default function ImageUpload({
  onImageUploaded,
  bucketName = "images",
  folderPath = "",
  className = "",
  buttonLabel = "Upload Image",
  showPreview = true,
  existingImageUrl = "",
  maxSize = 5, // Default 5MB
  acceptedTypes = "image/*",
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(existingImageUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Create preview
      if (showPreview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      setUploading(true);

      // Get authenticated user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to upload images");
      }

      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      let filePath = `${fileName}.${fileExt}`;

      // Add folder path if provided
      if (folderPath) {
        // Replace any placeholders with user data
        const processedFolderPath = folderPath
          .replace(/\{userId\}/g, userData.user.id)
          .replace(/\{timestamp\}/g, Date.now().toString());

        filePath = `${processedFolderPath}/${filePath}`;
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update state
      setImageUrl(publicUrl);

      // Call the callback function
      onImageUploaded(publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept={acceptedTypes}
        className="hidden"
      />

      {/* Preview area */}
      {showPreview && preview && (
        <div className="mb-4 relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded border border-gray-200"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={triggerFileInput}
          >
            <span className="text-white">Change Image</span>
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={uploading}
        className={`px-4 py-2 rounded ${
          uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white transition-colors`}
      >
        {uploading ? "Uploading..." : buttonLabel}
      </button>

      {/* Error message */}
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </div>
  );
}
