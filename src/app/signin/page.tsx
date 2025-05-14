// src/app/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStoredAccounts } from "@/lib/accountManager";
import { captureAuthSession } from "@/lib/accountSwitcher";

// Define types for our stored account
interface StoredAccount {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  last_used: number;
}

// Define target account type
interface TargetAccount {
  id: string;
  email: string;
  username?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const [isAccountSwitch, setIsAccountSwitch] = useState(false);
  const [targetAccount, setTargetAccount] = useState<TargetAccount | null>(
    null
  );

  useEffect(() => {
    // Check for redirect parameter
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }

    // Check if there's an accountSwitch parameter
    const accountId = searchParams?.get("accountSwitch");
    if (accountId) {
      handleAccountSwitch(accountId);
    }
  }, [searchParams]);

  const handleAccountSwitch = async (accountId: string) => {
    setLoading(true);
    setIsAccountSwitch(true);

    try {
      // Find the account in stored accounts
      const accounts: StoredAccount[] = getStoredAccounts();
      const accountToSwitch = accounts.find((a) => a.id === accountId);

      if (accountToSwitch && accountToSwitch.email) {
        // Pre-fill the email field if we have the account info
        setEmail(accountToSwitch.email);
        setTargetAccount({
          id: accountToSwitch.id,
          email: accountToSwitch.email,
          // Make sure username is either string or undefined (not null)
          username: accountToSwitch.username || undefined,
        });

        // Use a non-null value for the message
        const displayName = accountToSwitch.username || accountToSwitch.email;
        setMessage(`Sign in to switch to account: ${displayName}`);
      } else {
        // Account not found in stored accounts
        setError("Account information not found. Please sign in normally.");
        setIsAccountSwitch(false);
      }
    } catch (error) {
      console.error("Error processing account switch:", error);
      setError("Failed to process account switch. Please sign in normally.");
      setIsAccountSwitch(false);
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

      // If account switch, check if we got the right account
      if (isAccountSwitch && targetAccount) {
        if (data.user?.id !== targetAccount.id) {
          console.warn("Signed in to a different account than requested");
          // Still continue, as we successfully signed in
        }
      }

      // For account switching, store refresh token
      if (data.user) {
        await captureAuthSession(data.user.id);
      }

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

    // Don't allow sign up during account switch
    if (isAccountSwitch) {
      setError("Please sign in with the account email shown above.");
      return;
    }

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

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isAccountSwitch ? "Switch Account" : "Account Access"}
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

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border rounded ${
                isAccountSwitch ? "bg-gray-100" : ""
              }`}
              placeholder="Enter your email"
              required
              readOnly={isAccountSwitch} // Make email read-only during account switch
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
              autoFocus={isAccountSwitch} // Focus password field during account switch
            />
            <div className="text-right mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`${
                isAccountSwitch ? "w-full" : "w-1/2"
              } bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50`}
            >
              {loading
                ? "Signing in..."
                : isAccountSwitch
                ? "Switch Account"
                : "Sign In"}
            </button>

            {/* Only show Sign Up during normal sign in */}
            {!isAccountSwitch && (
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>
            )}
          </div>
        </form>

        {/* Cancel account switch option */}
        {isAccountSwitch && (
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Cancel and return to home
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
