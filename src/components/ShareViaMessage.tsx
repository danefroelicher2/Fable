// src/components/ShareViaMessage.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface ShareViaMessageProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  articleId?: string;
  postId?: string;
}

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ShareViaMessage({
  isOpen,
  onClose,
  shareUrl,
  title,
  articleId,
  postId,
}: ShareViaMessageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize message with shared content
  useEffect(() => {
    if (isOpen) {
      setMessage(
        `Hey! I wanted to share this article with you: "${title}"\n\nCheck it out: ${shareUrl}`
      );
    }
  }, [isOpen, title, shareUrl]);

  // Search for users
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Search for users by username or full name, excluding current user
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq("id", user.id)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (err: any) {
      console.error("Error searching users:", err);
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // NEW SIMPLIFIED VERSION:
  const handleSendMessage = async () => {
    if (!user || !selectedUser || !message.trim()) {
      setError("Please select a user and enter a message");
      return;
    }

    try {
      setSending(true);
      setError(null);

      // Import the new simplified function
      const { sendSharedContentMessage } = await import(
        "@/lib/SharedContentUtils"
      );

      // Send shared content message directly
      const success = await sendSharedContentMessage(
        selectedUser.id,
        articleId ? "article" : "post",
        (articleId || postId) as string,
        message
      );

      if (success) {
        setSuccess(true);

        // Close modal after success
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setMessage("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share via Direct Message
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900 dark:border-green-700 dark:text-green-300">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Message sent successfully!
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search for a user
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Search Results */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((userResult) => (
                <button
                  key={userResult.id}
                  onClick={() => setSelectedUser(userResult)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    selectedUser?.id === userResult.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 overflow-hidden dark:bg-gray-600">
                      {userResult.avatar_url ? (
                        <img
                          src={userResult.avatar_url}
                          alt={userResult.username || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {(userResult.full_name || userResult.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {userResult.full_name ||
                          userResult.username ||
                          "Anonymous User"}
                      </div>
                      {userResult.username && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{userResult.username}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Sending to:
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2 overflow-hidden dark:bg-gray-600">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">
                      {(selectedUser.full_name || selectedUser.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedUser.full_name ||
                    selectedUser.username ||
                    "Anonymous User"}
                </div>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add a personal message..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 dark:bg-gray-700 dark:border-gray-600">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!selectedUser || !message.trim() || sending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}
