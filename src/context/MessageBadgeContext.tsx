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
  const lastClearedAtRef = useRef<number>(0); // FIXED: Track when badge was last cleared

  const refreshBadge = useCallback(async () => {
    if (!user || isRefreshingRef.current) {
      console.log(
        "MessageBadgeContext: Skipping refresh - no user or already refreshing"
      );
      return;
    }

    // FIXED: Check if badge was recently cleared (within last 5 seconds)
    const now = Date.now();
    const timeSinceCleared = now - lastClearedAtRef.current;
    if (timeSinceCleared < 5000) {
      // 5 seconds
      console.log(
        "MessageBadgeContext: Skipping refresh - badge was recently cleared"
      );
      return;
    }

    // Prevent multiple rapid refreshes
    if (now - lastRefreshRef.current < 1000) {
      // Increased to 1 second
      console.log(
        "MessageBadgeContext: Skipping refresh - too soon since last refresh"
      );
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      console.log("MessageBadgeContext: Fetching unread count...");

      // FIXED: Add small delay to ensure database consistency
      await new Promise((resolve) => setTimeout(resolve, 200));

      const count = await getUnreadCount();
      console.log("MessageBadgeContext: New unread count:", count);

      // FIXED: Only update if we actually got a valid count and it's not immediately after a clear
      const timeSinceClearedNow = Date.now() - lastClearedAtRef.current;
      if (timeSinceClearedNow > 3000) {
        // Only update if more than 3 seconds since last clear
        setUnreadCount(count);
      } else {
        console.log(
          "MessageBadgeContext: Ignoring count update - too soon after clear"
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
    lastClearedAtRef.current = Date.now(); // FIXED: Track when cleared

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // FIXED: Enhanced intelligent clear that persists across page reloads
  const markAsReadAndClear = useCallback(() => {
    console.log("MessageBadgeContext: Marking as read and clearing badge");
    setUnreadCount(0);
    lastClearedAtRef.current = Date.now();

    // FIXED: Store the clear timestamp in sessionStorage to persist across reloads
    if (typeof window !== "undefined") {
      sessionStorage.setItem("messageBadgeCleared", Date.now().toString());
    }

    // Clear any pending refresh timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const setBadgeCount = useCallback((count: number) => {
    console.log("MessageBadgeContext: Setting badge count to:", count);

    // FIXED: Check if badge was recently cleared before setting count
    const timeSinceCleared = Date.now() - lastClearedAtRef.current;
    if (timeSinceCleared < 3000) {
      console.log(
        "MessageBadgeContext: Ignoring setBadgeCount - badge was recently cleared"
      );
      return;
    }

    setUnreadCount(Math.max(0, count));
  }, []);

  // FIXED: Enhanced debounced refresh function with clear check
  const debouncedRefresh = useCallback(() => {
    // Check if badge was recently cleared
    const timeSinceCleared = Date.now() - lastClearedAtRef.current;
    if (timeSinceCleared < 3000) {
      console.log(
        "MessageBadgeContext: Skipping debouncedRefresh - badge was recently cleared"
      );
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a new timeout
    refreshTimeoutRef.current = setTimeout(() => {
      refreshBadge();
    }, 1000); // Increased delay
  }, [refreshBadge]);

  // FIXED: Initial load with session storage check
  useEffect(() => {
    if (user) {
      console.log(
        "MessageBadgeContext: User changed, checking for recent clears"
      );

      // FIXED: Check sessionStorage for recent clear
      if (typeof window !== "undefined") {
        const clearedTime = sessionStorage.getItem("messageBadgeCleared");
        if (clearedTime) {
          const timeSinceCleared = Date.now() - parseInt(clearedTime);
          if (timeSinceCleared < 10000) {
            // 10 seconds
            console.log(
              "MessageBadgeContext: Badge was recently cleared, not refreshing"
            );
            lastClearedAtRef.current = parseInt(clearedTime);
            setUnreadCount(0);
            return;
          }
        }
      }

      console.log("MessageBadgeContext: User changed, refreshing badge");
      // Add delay before initial refresh to let page settle
      setTimeout(() => {
        refreshBadge();
      }, 500);
    } else {
      console.log("MessageBadgeContext: No user, clearing badge");
      setUnreadCount(0);
    }
  }, [user, refreshBadge]);

  // FIXED: Enhanced real-time subscription
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

          // FIXED: Check if badge was recently cleared before updating
          const timeSinceCleared = Date.now() - lastClearedAtRef.current;
          if (timeSinceCleared < 3000) {
            console.log(
              "MessageBadgeContext: Ignoring new message - badge was recently cleared"
            );
            return;
          }

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

          // FIXED: If message was marked as read, clear the badge
          if (payload.new && payload.new.is_read === true) {
            console.log(
              "MessageBadgeContext: Message marked as read, clearing badge"
            );
            markAsReadAndClear();
          } else {
            // Otherwise refresh after a delay
            setTimeout(() => {
              debouncedRefresh();
            }, 1000);
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

  // FIXED: Enhanced custom event listeners
  useEffect(() => {
    const handleClear = () => {
      console.log("MessageBadgeContext: Received clear event");
      clearBadge();
    };

    const handleRefresh = () => {
      console.log("MessageBadgeContext: Received refresh event");

      // FIXED: Check if badge was recently cleared
      const timeSinceCleared = Date.now() - lastClearedAtRef.current;
      if (timeSinceCleared > 3000) {
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

  // FIXED: Cleanup session storage on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        // Clean up old session storage entries (older than 1 hour)
        const clearedTime = sessionStorage.getItem("messageBadgeCleared");
        if (clearedTime) {
          const timeSinceCleared = Date.now() - parseInt(clearedTime);
          if (timeSinceCleared > 3600000) {
            // 1 hour
            sessionStorage.removeItem("messageBadgeCleared");
          }
        }
      }
    };
  }, []);

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
