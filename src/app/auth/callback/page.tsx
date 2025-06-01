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
        console.log("Auth callback triggered");

        // Get all URL parameters
        const allParams = Object.fromEntries(searchParams?.entries() || []);
        console.log("All URL params:", allParams);

        const type = searchParams?.get("type");
        console.log("Auth type detected:", type);

        // If this is a password recovery, redirect immediately to reset page
        if (type === "recovery") {
          console.log(
            "Password recovery detected, redirecting to reset password page"
          );
          // Pass all current URL params to the reset page
          const currentUrl = new URL(window.location.href);
          const resetUrl = `/reset-password${currentUrl.search}`;
          console.log("Redirecting to:", resetUrl);
          router.replace(resetUrl);
          return;
        }

        // For other types of auth (like email confirmation)
        console.log("Non-recovery auth, checking session...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError("Authentication failed. Please try again.");
          return;
        }

        if (data.session) {
          console.log("Valid session found, redirecting to home");
          router.replace("/");
        } else {
          console.log("No session found, redirecting to signin");
          router.replace(
            "/signin?message=Please check your email and click the confirmation link."
          );
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication.");
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    // Add small delay to ensure page is ready
    const timer = setTimeout(() => {
      handleAuthCallback();
    }, 100);

    return () => clearTimeout(timer);
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
