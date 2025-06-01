// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // EXACT WORKING VERIFICATION LOGIC - DO NOT TOUCH
  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking reset password session");
      console.log(
        "URL search params:",
        Object.fromEntries(searchParams?.entries() || [])
      );

      try {
        // Check if we have access token and refresh token in URL
        const accessToken = searchParams?.get("access_token");
        const refreshToken = searchParams?.get("refresh_token");
        const type = searchParams?.get("type");

        console.log(
          "URL params - Type:",
          type,
          "Has access token:",
          !!accessToken,
          "Has refresh token:",
          !!refreshToken
        );

        if (accessToken && refreshToken) {
          console.log("Found tokens in URL, setting session...");

          // Set the session using the tokens from the URL
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          console.log(
            "Session set result:",
            sessionData?.session ? "Success" : "Failed",
            sessionError?.message || "No error"
          );

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setError(
              "Invalid or expired reset link. Please request a new password reset."
            );
          } else if (sessionData.session) {
            console.log(
              "Session successfully set, enabling password reset form"
            );
            setIsValidToken(true);
          } else {
            console.log("No session returned after setting tokens");
            setError(
              "Invalid or expired reset link. Please request a new password reset."
            );
          }
        } else {
          console.log("No tokens found in URL, checking existing session...");

          // Check if we already have a valid session
          const { data: authData, error: authError } =
            await supabase.auth.getSession();

          console.log(
            "Existing session check:",
            authData?.session ? "Has session" : "No session",
            authError?.message || "No error"
          );

          if (authData.session && authData.session.user) {
            console.log("Found existing valid session");
            setIsValidToken(true);
          } else {
            console.log("No valid session found");
            setError(
              "Invalid reset link. Please request a new password reset from the sign-in page."
            );
          }
        }
      } catch (err) {
        console.error("Error in checkSession:", err);
        setError("An error occurred while validating the reset link.");
      } finally {
        console.log("Setting checkingToken to false");
        setCheckingToken(false);
      }
    };

    // Add a small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      checkSession();
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // FIXED PASSWORD UPDATE WITH TIMEOUT PROTECTION
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    // Validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    console.log("Starting password update...");

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Password update timed out");
      setLoading(false);
      setError(
        "Password update is taking too long. Please try again or contact support."
      );
    }, 10000); // 10 second timeout

    try {
      console.log("Calling supabase.auth.updateUser...");

      // Create a race between the API call and a timeout
      const updatePromise = supabase.auth.updateUser({
        password: newPassword,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 8000);
      });

      const result = (await Promise.race([
        updatePromise,
        timeoutPromise,
      ])) as any;

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (result?.error) {
        console.error("Password update error:", result.error);
        throw result.error;
      }

      console.log("Password updated successfully!");
      setLoading(false);
      setMessage("✅ Password updated successfully! Redirecting to sign in...");

      // Force redirect after short delay
      setTimeout(() => {
        console.log("Forcing redirect to sign in...");
        try {
          window.location.replace(
            "/signin?message=" +
              encodeURIComponent(
                "Password updated successfully! Please sign in with your new password."
              )
          );
        } catch (redirectError) {
          console.error("Redirect failed, trying alternative:", redirectError);
          // Fallback redirect method
          window.location.href = "/signin";
        }
      }, 2000);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Error updating password:", err);
      setLoading(false);

      if (err.message === "Request timeout") {
        setError(
          "The request is taking too long. Your password may have been updated. Please try signing in, or request another reset if needed."
        );
        // Show manual redirect option
        setTimeout(() => {
          setMessage("Click here to go to sign in: ");
        }, 3000);
      } else {
        setError(err.message || "Failed to update password. Please try again.");
      }
    }
  };

  // Show loading while checking token
  if (checkingToken) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if invalid token
  if (!isValidToken) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6">
            Reset Password
          </h1>

          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/signin")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Set New Password
        </h1>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your new password"
              required
              minLength={6}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Confirm your new password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Updating Password...
              </div>
            ) : (
              "Update Password"
            )}
          </button>

          {loading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                If this takes too long, you can{" "}
                <button
                  type="button"
                  onClick={() => {
                    setLoading(false);
                    window.location.href = "/signin";
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  return to sign in
                </button>{" "}
                and try again.
              </p>
            </div>
          )}

          {message && message.includes("Click here") && (
            <div className="mt-4 text-center">
              <button
                onClick={() => (window.location.href = "/signin")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
