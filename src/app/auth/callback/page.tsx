// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check what type of callback this is
        const type = searchParams?.get("type");

        if (type === "recovery") {
          // This is a password reset, redirect to reset password page with tokens
          const accessToken = searchParams?.get("access_token");
          const refreshToken = searchParams?.get("refresh_token");

          if (accessToken && refreshToken) {
            // Redirect to reset password page with the tokens
            const resetUrl = `/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=recovery`;
            router.replace(resetUrl);
            return;
          }
        }

        // For other auth callbacks (like email confirmation)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError("Authentication failed. Please try again.");
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to home
          router.replace("/");
        } else {
          // No session, redirect to signin
          router.replace(
            "/signin?message=Please check your email and click the confirmation link."
          );
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication.");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">
          {loading ? "Processing authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
