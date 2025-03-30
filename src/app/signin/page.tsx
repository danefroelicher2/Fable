"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // If already logged in, show different UI
  if (user) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6">
            Already Signed In
          </h1>
          <p className="text-center mb-6">
            You are already signed in as {user.email}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Home
            </Link>
            <Link
              href="/profile"
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        setMessage("Sign in successful! Redirecting...");
        // Add a slight delay before redirecting to show the success message
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setMessage("Check your email for the confirmation link");
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Account Access</h1>

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

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
