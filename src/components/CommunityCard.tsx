// src/components/CommunityCard.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  banner_url: string | null;
  member_count: number;
  is_member?: boolean;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
}

export default function CommunityCard({
  id,
  name,
  description,
  image_url,
  banner_url, // Added banner_url prop
  member_count,
  is_member,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  // Decide which image to display - use banner_url as primary, then image_url as fallback
  const displayImage = banner_url || image_url;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Cover image area - use banner_url or image_url if available */}
      <div className="aspect-video bg-blue-800 relative flex items-center justify-center">
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl text-blue-400 font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">
            {member_count} member{member_count !== 1 ? "s" : ""}
          </span>
          {onJoin && onLeave && (
            <button
              onClick={() => (is_member ? onLeave(id) : onJoin(id))}
              className={`px-4 py-2 rounded ${
                is_member ? "bg-gray-700 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {is_member ? "Leave" : "Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
