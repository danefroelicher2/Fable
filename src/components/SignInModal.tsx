// src/components/SignInModal.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { storeAccount, storeSessionForAccount } from "@/lib/accountManager"; // Import the functions

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

  // Check for pre-filled email from account switching
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const switchToAccount = localStorage.getItem("switch_to_account");
      if (switchToAccount) {
        setEmail(switchToAccount);
        // Clear it after using it
        localStorage.removeItem("switch_to_account");
      }
    }
  }, [isOpen]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: isEmail ? email : `${email}@example.com`, // If username, convert to email format
        password,
      });

      if (error) throw error;

      // If sign-in successful, store the account info
      if (data.user) {
        // Fetch the user's profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", data.user.id)
          .single();

        // Store the account
        storeAccount({
          id: data.user.id,
          email: data.user.email!,
          username: profileData?.username || null,
          full_name: profileData?.full_name || null,
          avatar_url: profileData?.avatar_url || null,
        });

        // Store the session data for future use
        if (data.session) {
          storeSessionForAccount(data.user.id, data.session);
        }
      }

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
    // Fixed overlay - higher z-index and full-screen backdrop
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] backdrop-blur-sm">
      {/* Backdrop overlay that handles clicks outside the modal */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal content */}
      <div
        ref={modalRef}
        className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-6 relative z-[10000]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
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

        {/* Logo */}
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

        {/* Title - Changed the color to match labels */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Account Access
        </h1>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email/Username input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Error message */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Next button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:text-blue-500 text-sm"
            onClick={() => {
              // Handle forgot password
              console.log("Forgot password clicked");
            }}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
