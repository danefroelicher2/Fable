// src/context/MessageBadgeContext.tsx - NEW FILE
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getUnreadCount } from "@/lib/messageUtils";

interface MessageBadgeContextType {
  unreadCount: number;
  refreshBadge: () => Promise<void>;
  clearBadge: () => void;
  setBadgeCount: (count: number) => void;
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
  const { user } = useAuth();

  const refreshBadge = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadCount();
      console.log("MessageBadgeContext: Refreshed badge count:", count);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error refreshing badge:", error);
      setUnreadCount(0);
    }
  }, [user]);

  const clearBadge = useCallback(() => {
    console.log("MessageBadgeContext: Clearing badge");
    setUnreadCount(0);
  }, []);

  const setBadgeCount = useCallback((count: number) => {
    console.log("MessageBadgeContext: Setting badge count to:", count);
    setUnreadCount(count);
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshBadge();
    } else {
      setUnreadCount(0);
    }
  }, [user, refreshBadge]);

  // Listen for global events
  useEffect(() => {
    const handleRefresh = () => {
      console.log("MessageBadgeContext: Received refresh event");
      refreshBadge();
    };

    const handleClear = () => {
      console.log("MessageBadgeContext: Received clear event");
      clearBadge();
    };

    window.addEventListener("refreshMessageBadge", handleRefresh);
    window.addEventListener("clearMessageBadge", handleClear);
    window.addEventListener("messagesRead", handleRefresh);
    window.addEventListener("conversationOpened", handleRefresh);
    window.addEventListener("forceRefreshBadge", handleRefresh);

    return () => {
      window.removeEventListener("refreshMessageBadge", handleRefresh);
      window.removeEventListener("clearMessageBadge", handleClear);
      window.removeEventListener("messagesRead", handleRefresh);
      window.removeEventListener("conversationOpened", handleRefresh);
      window.removeEventListener("forceRefreshBadge", handleRefresh);
    };
  }, [refreshBadge, clearBadge]);

  const value = {
    unreadCount,
    refreshBadge,
    clearBadge,
    setBadgeCount,
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
