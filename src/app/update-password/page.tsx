// src/app/update-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Handle the password reset flow
    initializePasswordReset();
  }, []);

  async function initializePasswordReset() {
    try {
      console.log("Initializing password reset...");
      setInitializing(true);

      // First, listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);

        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery event detected");
          setIsReady(true);
          setInitializing(false);
        } else if (event === "SIGNED_IN" && session) {
          console.log("User signed in during password reset");
          setIsReady(true);
          setInitializing(false);
        }
      });

      // Check current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (session) {
        console.log("Found existing session");
        setIsReady(true);
      }

      // Give it a moment to process auth state changes
      setTimeout(() => {
        if (!isReady) {
          console.log(
            "No auth state change detected, checking if user is already authenticated"
          );
          // Try one more time to get the session
          checkSessionFinal();
        }
        setInitializing(false);
      }, 2000);

      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error("Error initializing password reset:", err);
      setError(
        "Failed to initialize password reset. Please try the link again."
      );
      setInitializing(false);
    }
  }

  async function checkSessionFinal() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Final session check error:", error);
        setError(
          "Your reset link may have expired. Please request a new password reset."
        );
        return;
      }

      if (session && session.user) {
        console.log("Session found in final check");
        setIsReady(true);
      } else {
        console.log("No session found in final check");
        setError(
          "Your reset link may have expired. Please request a new password reset."
        );
      }
    } catch (err) {
      console.error("Error in final session check:", err);
      setError("Something went wrong. Please try again.");
    }
  }

  async function handlePasswordUpdate() {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log("Already updating password, ignoring duplicate call");
      return;
    }

    console.log("Starting password update...");
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Validation
      if (!newPassword || !confirmPassword) {
        console.log("Validation failed: missing fields");
        setError("Please fill in both password fields");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        console.log("Validation failed: passwords don't match");
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        console.log("Validation failed: password too short");
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      console.log("Validation passed, calling Supabase updateUser...");

      // Update the password - this is the critical part
      const updateResult = await supabase.auth.updateUser({
        password: newPassword,
      });

      console.log("Supabase updateUser completed:", updateResult);

      // Check for errors
      if (updateResult.error) {
        console.error("Password update failed:", updateResult.error);

        if (
          updateResult.error.message.includes(
            "New password should be different"
          )
        ) {
          setError(
            "New password must be different from your previous password"
          );
        } else if (
          updateResult.error.message.includes("Password should be at least")
        ) {
          setError("Password must be at least 6 characters long");
        } else if (
          updateResult.error.message.includes(
            "Unable to validate email address"
          )
        ) {
          setError(
            "Reset session expired. Please request a new password reset."
          );
        } else {
          setError(`Failed to update password: ${updateResult.error.message}`);
        }
        setLoading(false);
        return;
      }

      // SUCCESS - immediately stop loading and show success
      console.log("Password update successful! Setting loading to false...");
      setLoading(false);

      console.log("Showing success message...");
      setMessage("Password updated successfully! Redirecting to sign in...");

      console.log("Clearing form fields...");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect after delay
      console.log("Setting up redirect timer...");
      setTimeout(() => {
        console.log("Executing redirect to sign in...");
        router.push(
          "/signin?message=" +
            encodeURIComponent(
              "Password updated successfully! Please sign in with your new password."
            )
        );
      }, 3000);
    } catch (error: any) {
      console.error("Unexpected error in handlePasswordUpdate:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  // Show loading while initializing
  if (initializing) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Setting Up Password Reset...
          </h2>
          <p className="text-gray-600">
            Please wait a moment while we prepare your password reset.
          </p>
        </div>
      </div>
    );
  }

  // Show error if reset failed
  if (!isReady && error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reset Link Issue
          </h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-left">
            {error}
          </div>
          <div className="space-y-3">
            <Link
              href="/password-reset"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/signin"
              className="block w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if not ready and no error (shouldn't normally happen)
  if (!isReady) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Process Reset
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't process your password reset link. This might happen if
            the link is too old or has already been used.
          </p>
          <div className="space-y-3">
            <Link
              href="/password-reset"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/signin"
              className="block w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show the password update form
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Update Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below
        </p>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form submitted, calling handlePasswordUpdate");
            handlePasswordUpdate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your new password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your new password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            onClick={(e) => {
              console.log("Button clicked directly");
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Updating Password...
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-blue-600 hover:text-blue-800">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
