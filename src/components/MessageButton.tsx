// src/components/MessageButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sendMessage } from "@/lib/messageUtils";

interface MessageButtonProps {
  recipientId: string;
  className?: string;
  buttonText?: string;
  variant?: "primary" | "secondary" | "text";
}

export default function MessageButton({
  recipientId,
  className = "",
  buttonText = "Message",
  variant = "primary",
}: MessageButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle button click
  const handleClick = () => {
    if (!user) {
      // Redirect to sign in if not logged in
      router.push(
        `/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    // Don't allow sending message to self
    if (user.id === recipientId) {
      return;
    }

    setShowModal(true);
  };

  // Handle sending the message
  const handleSend = async () => {
    setError("");

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);

    try {
      const success = await sendMessage(recipientId, message);

      if (success) {
        setSuccess(true);

        // Close modal after a delay on success
        setTimeout(() => {
          setShowModal(false);
          setMessage("");
          setSuccess(false);

          // Navigate to messages page to see the conversation
          router.push(`/messages?user=${recipientId}`);
        }, 1500);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("An error occurred while sending your message");
    } finally {
      setSending(false);
    }
  };

  // Button styles based on variant
  const buttonStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md",
    secondary:
      "border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md",
    text: "text-blue-600 hover:text-blue-800",
  };

  // Don't show button if it's the user's own profile
  if (user?.id === recipientId) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`${buttonStyles[variant]} ${className}`}
      >
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          {buttonText}
        </span>
      </button>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative dark:bg-gray-800">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={sending}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Send Message
              </h3>

              {success ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 dark:bg-green-900 dark:text-green-200">
                  Message sent successfully!
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 dark:bg-red-900 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={sending}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      disabled={sending}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending || !message.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {sending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Send"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
