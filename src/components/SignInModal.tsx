// src/components/SignInModal.tsx
// We need to update the modal container to have a higher z-index and prevent interaction with elements below it

"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Add this to prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if input is an email or username
      const isEmail = email.includes("@");

      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: isEmail ? email : `${email}@example.com`, // If username, convert to email format
        password,
      });

      if (error) throw error;

      // Close modal on successful sign in
      onClose();
      window.location.reload(); // Refresh to update auth state
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className="bg-black border border-gray-800 rounded-xl w-full max-w-md p-6 relative z-[10000]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* X logo */}
        <div className="flex justify-center mb-8 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Sign in to LOSTLIBRARY
        </h1>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email/Username input */}
          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              className="w-full bg-black border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Error message */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Next button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-white text-black font-bold py-3 px-4 rounded-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Next"}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="mt-4 text-center">
          <button
            className="text-blue-400 hover:text-blue-300 text-sm"
            onClick={() => {
              // Handle forgot password
              console.log("Forgot password clicked");
            }}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
