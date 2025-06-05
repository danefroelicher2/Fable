// src/components/MessageBadge.tsx - CONTEXT-BASED VERSION
"use client";

import { useMessageBadge } from "@/context/MessageBadgeContext";

interface MessageBadgeProps {
  className?: string;
}

export default function MessageBadge({ className = "" }: MessageBadgeProps) {
  const { unreadCount, isLoading } = useMessageBadge();

  console.log(
    "MessageBadge: Rendering with count:",
    unreadCount,
    "loading:",
    isLoading
  );

  // Don't show badge if count is 0 or still loading
  if (unreadCount === 0 || isLoading) return null;

  return (
    <div
      className={`bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center min-w-[20px] h-5 ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </div>
  );
}
