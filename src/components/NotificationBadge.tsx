// src/components/NotificationBadge.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface NotificationBadgeProps {
  className?: string;
}

export default function NotificationBadge({ className = "" }: NotificationBadgeProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    // Fetch unread notification count
    fetchNotificationCount();

    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('notification_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
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
  }, [user]);

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
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  }

  if (count === 0) return null;

  return (
    <div className={`bg-red-600 text-white text-xs rounded-full flex items-center justify-center ${className}`}>
      {count > 99 ? "99+" : count}
    </div>
  );
}