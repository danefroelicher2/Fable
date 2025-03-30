"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error: any) {
      setMessage(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Get the full origin for the redirect URL
      const origin = window.location.origin;
      console.log("Using redirect URL:", `${origin}/auth/callback`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            // Store additional user metadata if needed
            origin: origin,
          },
        },
      });

      if (error) throw error;

      setMessage(
        "Please check your email for the confirmation link. " +
          "Click the link in the email to complete your registration. " +
          "If you don't see it, check your spam folder. " +
          "If the confirmation link doesn't work, you can " +
          "manually confirm your email by going to the " +
          `<a href="/auth/manual-confirm" class="text-blue-700 underline">manual confirmation page</a>.`
      );
    } catch (error: any) {
      setMessage(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Account Access</h1>

        {message && (
          <div
            className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}

        <form className="space-y-4" onSubmit={handleSignIn}>
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
      </div>
    </div>
  );
}
