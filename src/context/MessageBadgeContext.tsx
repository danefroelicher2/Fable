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
  markAsReadAndClear: () => void;
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

  // Use refs to prevent race conditions and track state
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);

  // FIXED: Reduced the "recently cleared" time window significantly
  const lastClearedAtRef = useRef<number>(0);
  const CLEAR_PROTECTION_TIME = 1500; // Reduced from 5000ms to 1500ms (1.5 seconds)

  const refreshBadge = useCallback(async () => {
    if (!user || isRefreshingRef.current) {
      console.log(
        "MessageBadgeContext: Skipping refresh - no user or already refreshing"
      );
      return;
    }

    // FIXED: Much shorter protection time after clearing
    const now = Date.now();
    const timeSinceCleared = now - lastClearedAtRef.current;
    if (timeSinceCleared < CLEAR_PROTECTION_TIME) {
      console.log(
        `MessageBadgeContext: Skipping refresh - badge was recently cleared (${timeSinceCleared}ms ago)`
      );
      return;
    }

    // Prevent multiple rapid refreshes
    if (now - lastRefreshRef.current < 800) {
      console.log(
        "MessageBadgeContext: Skipping refresh - too soon since last refresh"
      );
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      console.log("MessageBadgeContext: Fetching unread count...");

      // Small delay to ensure database consistency
      await new Promise((resolve) => setTimeout(resolve, 150));

      const count = await getUnreadCount();
      console.log("MessageBadgeContext: New unread count:", count);

      // FIXED: Only check clear time if count > 0, always allow count to be set to proper value
      const timeSinceClearedNow = Date.now() - lastClearedAtRef.current;
      if (count > 0 || timeSinceClearedNow > CLEAR_PROTECTION_TIME) {
        setUnreadCount(count);
        console.log("MessageBadgeContext: Updated badge count to:", count);
      } else {
        console.log(
          "MessageBadgeContext: Keeping count at 0 due to recent clear"
        );
      }

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
    lastClearedAtRef.current = Date.now();

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // FIXED: Simplified markAsReadAndClear without session storage interference
  const markAsReadAndClear = useCallback(() => {
    console.log("MessageBadgeContext: Marking as read and clearing badge");
    setUnreadCount(0);
    lastClearedAtRef.current = Date.now();

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // REMOVED: Session storage logic that was causing interference
  }, []);

  const setBadgeCount = useCallback((count: number) => {
    console.log("MessageBadgeContext: Setting badge count to:", count);

    // FIXED: Shorter protection time and better logic
    const timeSinceCleared = Date.now() - lastClearedAtRef.current;
    if (timeSinceCleared < CLEAR_PROTECTION_TIME && count > 0) {
      console.log(
        `MessageBadgeContext: Ignoring setBadgeCount - badge was recently cleared (${timeSinceCleared}ms ago)`
      );
      return;
    }

    setUnreadCount(Math.max(0, count));
  }, []);

  // FIXED: Simplified debounced refresh without excessive clear checks
  const debouncedRefresh = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a new timeout with shorter delay
    refreshTimeoutRef.current = setTimeout(() => {
      refreshBadge();
    }, 800); // Reduced from 1000ms
  }, [refreshBadge]);

  // FIXED: Simplified initial load without session storage
  useEffect(() => {
    if (user) {
      console.log("MessageBadgeContext: User changed, refreshing badge");
      // Add delay before initial refresh to let page settle
      setTimeout(() => {
        refreshBadge();
      }, 300); // Reduced delay
    } else {
      console.log("MessageBadgeContext: No user, clearing badge");
      setUnreadCount(0);
    }
  }, [user, refreshBadge]);

  // FIXED: Enhanced real-time subscription with better logic
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

          // FIXED: Only check clear time if very recent (within 1 second)
          const timeSinceCleared = Date.now() - lastClearedAtRef.current;
          if (timeSinceCleared < 1000) {
            console.log(
              "MessageBadgeContext: Ignoring new message - badge was just cleared"
            );
            return;
          }

          // Refresh badge after new message
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

          // If message was marked as read, clear the badge
          if (payload.new && payload.new.is_read === true) {
            console.log(
              "MessageBadgeContext: Message marked as read, clearing badge"
            );
            markAsReadAndClear();
          } else {
            // Otherwise refresh after a short delay
            setTimeout(() => {
              debouncedRefresh();
            }, 500);
          }
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
  }, [user, debouncedRefresh, markAsReadAndClear]);

  // FIXED: Simplified custom event listeners
  useEffect(() => {
    const handleClear = () => {
      console.log("MessageBadgeContext: Received clear event");
      clearBadge();
    };

    const handleRefresh = () => {
      console.log("MessageBadgeContext: Received refresh event");

      // FIXED: More lenient refresh check
      const timeSinceCleared = Date.now() - lastClearedAtRef.current;
      if (timeSinceCleared > 1000) {
        // Reduced from 3000ms
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
