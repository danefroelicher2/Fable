"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  onAvatarChange: (url: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function AvatarUpload({
  currentAvatarUrl,
  fullName,
  username,
  email,
  onAvatarChange,
  size = "md",
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the first letter for the avatar placeholder
  const firstLetter = (
    fullName?.charAt(0) ||
    username?.charAt(0) ||
    email?.charAt(0) ||
    "U"
  ).toUpperCase();

  // Size classes mapping
  const sizeClasses = {
    sm: "h-16 w-16 text-xl",
    md: "h-24 w-24 text-2xl",
    lg: "h-32 w-32 text-4xl",
    xl: "h-40 w-40 text-5xl",
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      onAvatarChange(tempUrl);

      // Here you would typically upload the file to storage
      // and then update the avatar URL with the permanent URL
      // For now, we're just using the temporary object URL
    }
  };

  // Trigger file input click
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden cursor-pointer`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={triggerFileSelect}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          firstLetter
        )}

        {/* Hover overlay */}
        {isHovering && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-sm text-gray-600 mt-2">Click to change</p>
    </div>
  );
}
