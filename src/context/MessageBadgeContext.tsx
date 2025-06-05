// src/context/MessageBadgeContext.tsx - FIXED VERSION
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

  const refreshBadge = useCallback(async () => {
    if (!user || isRefreshingRef.current) {
      console.log(
        "MessageBadgeContext: Skipping refresh - no user or already refreshing"
      );
      return;
    }

    // Prevent multiple rapid refreshes
    const now = Date.now();
    if (now - lastRefreshRef.current < 500) {
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
    }, 300); // 300ms delay to debounce multiple calls
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
          debouncedRefresh();
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
          debouncedRefresh();
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

  // Listen for custom events with debouncing
  useEffect(() => {
    const handleClear = () => {
      console.log("MessageBadgeContext: Received clear event");
      clearBadge();
    };

    const handleRefresh = () => {
      console.log("MessageBadgeContext: Received refresh event");
      debouncedRefresh();
    };

    const handleMessagesRead = () => {
      console.log("MessageBadgeContext: Messages marked as read");
      clearBadge();
      // Refresh after a longer delay to ensure DB is updated
      setTimeout(() => {
        debouncedRefresh();
      }, 1000);
    };

    const handleConversationOpened = () => {
      console.log("MessageBadgeContext: Conversation opened");
      clearBadge();
      // Refresh after delay to get accurate count
      setTimeout(() => {
        debouncedRefresh();
      }, 800);
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
  }, [clearBadge, debouncedRefresh]);

  const value = {
    unreadCount,
    refreshBadge,
    clearBadge,
    setBadgeCount,
    isLoading,
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
