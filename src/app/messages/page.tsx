// src/app/messages/page.tsx - JSX SYNTAX FIXED VERSION
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMessageBadge } from "@/context/MessageBadgeContext";
import Link from "next/link";
import SharedContentMessage from "@/components/SharedContentMessage";
import {
  getConversations,
  getConversation,
  sendMessage,
  markMessagesAsRead,
  markAllMessagesAsRead,
  ConversationSummary,
  Message,
} from "@/lib/messageUtils";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearBadge, refreshBadge, markAsReadAndClear } = useMessageBadge();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // User search states
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle searchParams safely after component mounts
  useEffect(() => {
    setMounted(true);
    if (searchParams) {
      const userParam = searchParams.get("user");
      setSelectedUserId(userParam);
    }
  }, [searchParams]);

  // Function to trigger badge refresh using context
  // Function to trigger badge refresh using context
  const triggerBadgeRefresh = useCallback(() => {
    console.log("Messages page: Marking messages as read and clearing badge");
    markAsReadAndClear();
  }, [markAsReadAndClear]);

  // User search function
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          const filteredResults = data.filter(
            (profile) => profile.id !== user?.id
          );
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [user?.id]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // Handle user selection from search
  const handleUserSelect = useCallback(
    async (selectedUser: any) => {
      setShowUserSearch(false);
      setSearchQuery("");
      setSearchResults([]);

      const existingConvo = conversations.find(
        (c) => c.user_id === selectedUser.id
      );

      if (existingConvo) {
        selectConversation(existingConvo);
      } else {
        const newConvo: ConversationSummary = {
          user_id: selectedUser.id,
          username: selectedUser.username,
          full_name: selectedUser.full_name,
          avatar_url: selectedUser.avatar_url,
          last_message: "",
          last_message_date: new Date().toISOString(),
          unread_count: 0,
        };

        setSelectedConversation(newConvo);
        setSelectedUserId(selectedUser.id);
        setMessages([]);
        router.push(`/messages?user=${selectedUser.id}`, { scroll: false });
      }
    },
    [conversations, router]
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showUserSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showUserSearch]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserSearch && !target.closest(".user-search-container")) {
        setShowUserSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserSearch]);

  // Enhanced scroll function that reliably scrolls to bottom
  const scrollToBottom = useCallback(
    (behavior: "auto" | "smooth" = "smooth") => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        if (behavior === "auto") {
          container.scrollTop = container.scrollHeight;
        } else {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    },
    []
  );

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom("auto");
      }, 150);
    }
  }, [messages, scrollToBottom]);

  // Function for fetching conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const conversationsList = await getConversations();
      setConversations(conversationsList);

      if (selectedUserId && conversationsList.length > 0) {
        const selectedConvo = conversationsList.find(
          (c) => c.user_id === selectedUserId
        );

        if (selectedConvo) {
          setSelectedConversation(selectedConvo);
        } else {
          try {
            const { data: profileData, error } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .eq("id", selectedUserId)
              .single();

            if (!error && profileData) {
              const newConvo: ConversationSummary = {
                user_id: profileData.id,
                username: profileData.username,
                full_name: profileData.full_name,
                avatar_url: profileData.avatar_url,
                last_message: "",
                last_message_date: new Date().toISOString(),
                unread_count: 0,
              };
              setSelectedConversation(newConvo);
            }
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
          }
        }
      }

      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedUserId]);

  const fetchMessages = useCallback(
    async (userId: string) => {
      if (!user || !userId) return;

      try {
        setMessageLoading(true);
        const conversation = await getConversation(userId);
        setMessages(conversation);

        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
          }
        }, 200);

        // SMART: Mark messages as read and use intelligent badge clearing
        try {
          console.log("Starting to mark messages as read for user:", userId);

          // Use the smart clear function that prevents premature refresh
          markAsReadAndClear();

          // Mark messages as read in database
          await markMessagesAsRead(userId);
          console.log("Successfully marked messages as read for user:", userId);

          // Update local conversation state immediately
          setConversations((prevConversations) => {
            return prevConversations.map((conv) => {
              if (conv.user_id === userId) {
                return { ...conv, unread_count: 0 };
              }
              return conv;
            });
          });

          // The context will handle badge refresh intelligently after DB is updated
          console.log(
            "Messages marked as read, context will handle badge refresh"
          );
        } catch (readError) {
          console.error("Error marking messages as read:", readError);
          // If marking as read fails, clear badge and refresh to get accurate count
          markAsReadAndClear();
          setTimeout(() => {
            refreshBadge();
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setMessageLoading(false);
      }
    },
    [user, clearBadge, refreshBadge, markAsReadAndClear]
  );

  // Main effect for authentication and initial setup
  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent("/messages")}`);
      return;
    }

    markAllMessagesAsRead()
      .then(() => {
        console.log("Marked all messages as read on page visit");
        markAsReadAndClear();
      })
      .catch((err) => {
        console.error("Error marking all messages as read:", err);
      });

    fetchConversations();
  }, [user, router, mounted, fetchConversations, clearBadge]);

  // Load specific conversation when selectedUserId changes
  useEffect(() => {
    if (selectedUserId && user && initialLoadComplete && mounted) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, user, initialLoadComplete, mounted, fetchMessages]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !mounted) return;

    const messagesSubscription = supabase
      .channel(`messages-channel-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
          if (selectedUserId) {
            fetchMessages(selectedUserId);
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, selectedUserId, mounted, fetchConversations, fetchMessages]);

  // Message sending function
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sending) return;

    setSending(true);
    try {
      const success = await sendMessage(
        selectedConversation.user_id,
        newMessage
      );

      if (success) {
        setNewMessage("");
        await Promise.all([
          fetchMessages(selectedConversation.user_id),
          fetchConversations(),
        ]);

        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
          }
        }, 200);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }, [
    newMessage,
    selectedConversation,
    user,
    sending,
    fetchMessages,
    fetchConversations,
  ]);

  // Conversation selection function
  const selectConversation = useCallback(
    (conversation: ConversationSummary) => {
      console.log("Selecting conversation with user:", conversation.user_id);

      setSelectedConversation(conversation);
      setSelectedUserId(conversation.user_id);
      router.push(`/messages?user=${conversation.user_id}`, { scroll: false });

      // Use smart clear that prevents premature refresh
      markAsReadAndClear();

      // Fetch messages (which will handle the database update)
      fetchMessages(conversation.user_id);
    },
    [router, fetchMessages, markAsReadAndClear]
  );

  // Date formatting function
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date >= today) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (date >= yesterday) {
        return `Yesterday, ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  // Show loading state while mounting
  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Conversations sidebar */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Messages</h2>

              {/* Plus button for user search */}
              <div className="relative user-search-container">
                <button
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Start new conversation"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                {/* User search dropdown */}
                {showUserSearch && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-1">
                          {searchResults.map((searchUser) => (
                            <button
                              key={searchUser.id}
                              onClick={() => handleUserSelect(searchUser)}
                              className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden mr-3">
                                {searchUser.avatar_url ? (
                                  <img
                                    src={searchUser.avatar_url}
                                    alt={searchUser.username || "User"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {(
                                      searchUser.full_name ||
                                      searchUser.username ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-grow text-left">
                                <p className="font-medium dark:text-white">
                                  {searchUser.full_name ||
                                    searchUser.username ||
                                    "Anonymous User"}
                                </p>
                                {searchUser.username && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{searchUser.username}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No users found
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Type to search for users
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-grow">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                  <p>No conversations yet.</p>
                  <p className="mt-2">
                    Use the + button above to start a conversation!
                  </p>
                </div>
              ) : (
                <ul>
                  {conversations.map((conversation) => (
                    <li
                      key={conversation.user_id}
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedConversation?.user_id === conversation.user_id
                          ? "bg-blue-50 dark:bg-gray-700"
                          : ""
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="flex items-center p-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden">
                            {conversation.avatar_url ? (
                              <img
                                src={conversation.avatar_url}
                                alt={conversation.username || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold">
                                {(
                                  conversation.full_name ||
                                  conversation.username ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          {conversation.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="flex justify-between items-baseline">
                            <p className="font-medium dark:text-white">
                              {conversation.full_name ||
                                conversation.username ||
                                "Anonymous User"}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(conversation.last_message_date)}
                            </span>
                          </div>
                          <p
                            className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-1 ${
                              conversation.unread_count > 0
                                ? "font-semibold"
                                : ""
                            }`}
                          >
                            {conversation.last_message || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Link
                    href={`/user/${selectedConversation.user_id}`}
                    className="flex items-center hover:opacity-80"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden mr-3">
                      {selectedConversation.avatar_url ? (
                        <img
                          src={selectedConversation.avatar_url}
                          alt={selectedConversation.username || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {(
                            selectedConversation.full_name ||
                            selectedConversation.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">
                        {selectedConversation.full_name ||
                          selectedConversation.username ||
                          "Anonymous User"}
                      </p>
                      {selectedConversation.username && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{selectedConversation.username}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Chat messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-grow p-4 overflow-y-auto scrollbar-hide"
                >
                  {messageLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center p-6 text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                      <p>No messages yet.</p>
                      <p className="mt-2">
                        Start the conversation by sending a message below!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === user.id;
                        const showAvatar =
                          index === 0 ||
                          messages[index - 1].sender_id !== message.sender_id;

                        const isSharedContent =
                          message.message_type === "shared_content" &&
                          message.shared_content;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden mr-2 flex-shrink-0">
                                {message.sender_profile?.avatar_url ? (
                                  <img
                                    src={message.sender_profile.avatar_url}
                                    alt={
                                      message.sender_profile.username || "User"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {(
                                      message.sender_profile?.full_name ||
                                      message.sender_profile?.username ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                            )}

                            {isSharedContent ? (
                              <div
                                className={`rounded-lg max-w-[70%] ${
                                  isCurrentUser ? "ml-auto" : ""
                                }`}
                              >
                                <SharedContentMessage
                                  sharedContent={message.shared_content}
                                  personalMessage={
                                    message.content && message.content.trim()
                                      ? message.content
                                      : undefined
                                  }
                                  className={isCurrentUser ? "ml-auto" : ""}
                                />
                                <p
                                  className={`text-xs mt-2 px-2 ${
                                    isCurrentUser
                                      ? "text-blue-100 text-right"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatDate(message.created_at)}
                                </p>
                              </div>
                            ) : (
                              <div
                                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                                  isCurrentUser
                                    ? "bg-blue-600 text-white ml-auto"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                                }`}
                              >
                                <p>{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser
                                      ? "text-blue-100"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatDate(message.created_at)}
                                </p>
                              </div>
                            )}

                            {isCurrentUser && showAvatar && (
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden ml-2 flex-shrink-0">
                                {message.sender_profile?.avatar_url ? (
                                  <img
                                    src={message.sender_profile.avatar_url}
                                    alt={
                                      message.sender_profile.username || "User"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {(
                                      message.sender_profile?.full_name ||
                                      message.sender_profile?.username ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">
                  Your Messages
                </h3>
                <p className="mb-4">
                  Select a conversation or start a new one using the + button.
                </p>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
