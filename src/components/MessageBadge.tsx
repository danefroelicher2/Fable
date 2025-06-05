// src/components/MessageBadge.tsx - COMPLETE FIX
"use client";

import { useState, useEffect } from "react";
import { getUnreadCount } from "@/lib/messageUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { usePathname, useSearchParams } from "next/navigation";

interface MessageBadgeProps {
  className?: string;
}

export default function MessageBadge({ className = "" }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Function to fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  // Initial setup and real-time subscriptions
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to new messages (when someone sends TO this user)
    const messagesSubscription = supabase
      .channel(`messages-new-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to message updates (when messages are marked as read)
    const messagesUpdateSubscription = supabase
      .channel(`messages-update-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Message updated (likely marked as read):", payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      messagesUpdateSubscription.unsubscribe();
    };
  }, [user]);

  // Listen for custom events from the messages page
  useEffect(() => {
    const handleMessagesRead = () => {
      console.log("Custom messagesRead event received");
      fetchUnreadCount();
    };

    const handleConversationOpened = () => {
      console.log("Custom conversationOpened event received");
      // Add a small delay to allow the database update to complete
      setTimeout(() => {
        fetchUnreadCount();
      }, 500);
    };

    const handleForceRefresh = () => {
      console.log("Force refresh badge event received");
      // Immediate refresh and delayed refresh for reliability
      fetchUnreadCount();
      setTimeout(() => {
        fetchUnreadCount();
      }, 200);
      setTimeout(() => {
        fetchUnreadCount();
      }, 1000);
    };

    window.addEventListener("messagesRead", handleMessagesRead);
    window.addEventListener("conversationOpened", handleConversationOpened);
    window.addEventListener("forceRefreshBadge", handleForceRefresh);

    return () => {
      window.removeEventListener("messagesRead", handleMessagesRead);
      window.removeEventListener(
        "conversationOpened",
        handleConversationOpened
      );
      window.removeEventListener("forceRefreshBadge", handleForceRefresh);
    };
  }, []);

  // Monitor URL changes to detect when user opens specific conversations
  useEffect(() => {
    if (pathname?.startsWith("/messages") && user) {
      const selectedUserId = searchParams?.get("user");

      if (selectedUserId) {
        // User opened a specific conversation
        console.log(`User opened conversation with: ${selectedUserId}`);

        // Refresh badge after a delay to allow messages page to mark messages as read
        setTimeout(() => {
          fetchUnreadCount();
        }, 1000);
      }
    }
  }, [pathname, searchParams, user]);

  // Don't show badge if count is 0
  if (unreadCount === 0) return null;

  return (
    <div
      className={`bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </div>
  );
}
