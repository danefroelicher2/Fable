"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ManualConfirm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Try to verify the email with the provided token
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "signup",
      });

      if (error) throw error;

      setSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to verify your email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Manual Email Confirmation
        </h1>

        {success ? (
          <div className="text-center">
            <svg
              className="w-20 h-20 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>

            <h2 className="text-xl font-semibold mb-4">Email Confirmed!</h2>
            <p className="mb-4">Your email has been successfully verified.</p>
            <p className="text-gray-600 mb-4">Redirecting to homepage...</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Go to Homepage Now
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6">
              If you're having trouble with the email confirmation link, you can
              manually paste the confirmation token from your email below.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Confirmation Token (from your email)
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Paste the token here"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  The token can be found in the URL of the confirmation link in
                  your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
