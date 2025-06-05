// src/context/MessageBadgeContext.tsx - SMARTER VERSION
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getUnreadCount } from "@/lib/messageUtils";
import { supabase } from "@/lib/supabase";

interface MessageBadgeContextType {
  unreadCount: number;
  refreshBadge: () => Promise<void>;
  clearBadge: () => void;
  setBadgeCount: (count: number) => void;
  isLoading: boolean;
  markAsReadAndClear: () => void; // NEW: Intelligent clear that prevents refresh
}

const MessageBadgeContext = createContext<MessageBadgeContextType | undefined>(
  undefined
);

export function MessageBadgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Use refs to prevent race conditions and excessive API calls
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);
  const recentlyMarkedAsReadRef = useRef(false); // NEW: Track if recently marked as read

  const refreshBadge = useCallback(async () => {
    if (!user || isRefreshingRef.current) {
      console.log(
        "MessageBadgeContext: Skipping refresh - no user or already refreshing"
      );
      return;
    }

    // NEW: If we recently marked messages as read, wait a bit longer
    if (recentlyMarkedAsReadRef.current) {
      console.log(
        "MessageBadgeContext: Recently marked as read, waiting longer before refresh"
      );
      setTimeout(() => {
        recentlyMarkedAsReadRef.current = false;
        refreshBadge();
      }, 1500);
      return;
    }

    // Prevent multiple rapid refreshes
    const now = Date.now();
    if (now - lastRefreshRef.current < 800) {
      // Increased from 500ms to 800ms
      console.log(
        "MessageBadgeContext: Skipping refresh - too soon since last refresh"
      );
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      console.log("MessageBadgeContext: Fetching unread count...");

      const count = await getUnreadCount();
      console.log("MessageBadgeContext: New unread count:", count);

      setUnreadCount(count);
      lastRefreshRef.current = now;
    } catch (error) {
      console.error("MessageBadgeContext: Error refreshing badge:", error);
      // Don't reset to 0 on error, keep current count
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [user]);

  const clearBadge = useCallback(() => {
    console.log("MessageBadgeContext: Clearing badge immediately");
    setUnreadCount(0);

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // NEW: Intelligent clear that prevents immediate refresh
  const markAsReadAndClear = useCallback(() => {
    console.log("MessageBadgeContext: Marking as read and clearing badge");
    setUnreadCount(0);
    recentlyMarkedAsReadRef.current = true;

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Reset the flag after a longer delay
    setTimeout(() => {
      recentlyMarkedAsReadRef.current = false;
    }, 3000);
  }, []);

  const setBadgeCount = useCallback((count: number) => {
    console.log("MessageBadgeContext: Setting badge count to:", count);
    setUnreadCount(Math.max(0, count));
  }, []);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a new timeout
    refreshTimeoutRef.current = setTimeout(() => {
      refreshBadge();
    }, 500); // Increased from 300ms to 500ms
  }, [refreshBadge]);

  // Initial load when user changes
  useEffect(() => {
    if (user) {
      console.log("MessageBadgeContext: User changed, refreshing badge");
      refreshBadge();
    } else {
      console.log("MessageBadgeContext: No user, clearing badge");
      setUnreadCount(0);
    }
  }, [user, refreshBadge]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    console.log("MessageBadgeContext: Setting up real-time subscription");

    const messagesSubscription = supabase
      .channel(`badge-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("MessageBadgeContext: New message received:", payload);
          // Only refresh if we haven't recently marked messages as read
          if (!recentlyMarkedAsReadRef.current) {
            debouncedRefresh();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("MessageBadgeContext: Message updated:", payload);
          // Messages being updated usually means they're being marked as read
          // So we should refresh after a delay
          setTimeout(() => {
            debouncedRefresh();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      console.log("MessageBadgeContext: Cleaning up subscription");
      messagesSubscription.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, debouncedRefresh]);

  // Listen for custom events with smarter handling
  useEffect(() => {
    const handleClear = () => {
      console.log("MessageBadgeContext: Received clear event");
      clearBadge();
    };

    const handleRefresh = () => {
      console.log("MessageBadgeContext: Received refresh event");
      // Only refresh if we haven't recently marked as read
      if (!recentlyMarkedAsReadRef.current) {
        debouncedRefresh();
      }
    };

    const handleMessagesRead = () => {
      console.log("MessageBadgeContext: Messages marked as read");
      markAsReadAndClear();
    };

    const handleConversationOpened = () => {
      console.log("MessageBadgeContext: Conversation opened");
      markAsReadAndClear();
    };

    // Register event listeners
    window.addEventListener("clearMessageBadge", handleClear);
    window.addEventListener("refreshMessageBadge", handleRefresh);
    window.addEventListener("messagesRead", handleMessagesRead);
    window.addEventListener("conversationOpened", handleConversationOpened);
    window.addEventListener("forceRefreshBadge", handleRefresh);

    return () => {
      window.removeEventListener("clearMessageBadge", handleClear);
      window.removeEventListener("refreshMessageBadge", handleRefresh);
      window.removeEventListener("messagesRead", handleMessagesRead);
      window.removeEventListener(
        "conversationOpened",
        handleConversationOpened
      );
      window.removeEventListener("forceRefreshBadge", handleRefresh);

      // Cleanup timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [clearBadge, debouncedRefresh, markAsReadAndClear]);

  const value = {
    unreadCount,
    refreshBadge,
    clearBadge,
    setBadgeCount,
    isLoading,
    markAsReadAndClear,
  };

  return (
    <MessageBadgeContext.Provider value={value}>
      {children}
    </MessageBadgeContext.Provider>
  );
}

export function useMessageBadge() {
  const context = useContext(MessageBadgeContext);
  if (context === undefined) {
    throw new Error(
      "useMessageBadge must be used within a MessageBadgeProvider"
    );
  }
  return context;
}
