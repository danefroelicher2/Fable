// src/components/NotificationBadge.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

interface NotificationBadgeProps {
  className?: string;
}

export default function NotificationBadge({
  className = "",
}: NotificationBadgeProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    // Fetch unread notification count
    fetchNotificationCount();

    // Auto-dismiss when user visits the notifications page
    if (pathname === "/notifications" && count > 0) {
      markAllAsRead();
    }

    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel("notification_count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, pathname, count]);

  async function fetchNotificationCount() {
    try {
      if (!user) return;

      const { count, error } = await (supabase as any)
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setCount(count || 0);

      // Add debugging to help understand if the query is working
      console.log("Unread notification count:", count);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  }

  async function markAllAsRead() {
    try {
      if (!user) return;

      // Update all notifications for the user to read
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Update local state
      setCount(0);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }

  if (count === 0) return null;

  return (
    <div
      className={`bg-red-600 text-white text-xs rounded-full flex items-center justify-center min-w-[20px] min-h-[20px] px-1 ${className}`}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
}
