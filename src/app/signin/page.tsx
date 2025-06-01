// src/app/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStoredAccounts } from "@/lib/accountManager";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Check for redirect parameter
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }

    // Check for success message parameter
    const successMessage = searchParams?.get("message");
    if (successMessage) {
      setMessage(decodeURIComponent(successMessage));
    }

    // Check if there's an accountSwitch parameter
    const accountId = searchParams?.get("accountSwitch");
    if (accountId) {
      handleAccountSwitch(accountId);
    }
  }, [searchParams]);

  const handleAccountSwitch = async (accountId: string) => {
    setLoading(true);
    setMessage("Switching accounts... Please sign in again to continue.");

    try {
      // Find the account in stored accounts
      const accounts = getStoredAccounts();
      const accountToSwitch = accounts.find((a) => a.id === accountId);

      if (accountToSwitch && accountToSwitch.email) {
        // Pre-fill the email field if we have the account info
        setEmail(accountToSwitch.email);
      }
    } catch (error) {
      console.error("Error switching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Successful sign-in, redirect to the specified path or home
      router.push(redirectPath || "/");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the full origin for the redirect URL
      const origin = window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage(
        "Please check your email for the confirmation link. " +
          "Click the link in the email to complete your registration. " +
          "If you don't see it, check your spam folder."
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      setMessage(
        `Password reset email sent to ${email}. Check your inbox and click the reset link.`
      );
    } catch (err: any) {
      setError(err.message || "An error occurred while sending reset email");
    } finally {
      setLoading(false);
    }
  };

  // If showing forgot password form
  if (showForgotPassword) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6">
            Reset Password
          </h1>

          {message && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <p dangerouslySetInnerHTML={{ __html: message }} />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!resetEmailSent ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4">
                Check your email for the password reset link.
              </p>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Account Access</h1>

        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
            />
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </div>
        </form>

        {/* REMOVED: Terms and Privacy Policy section */}
      </div>
    </div>
  );
}
