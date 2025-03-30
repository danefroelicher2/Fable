"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmailConfirmed() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer to redirect to homepage
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
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

        <h1 className="text-3xl font-bold mb-4">Email Confirmed!</h1>

        <p className="text-lg mb-6">
          Your email has been successfully verified. Your account is now active.
        </p>

        <p className="text-gray-600 mb-6">
          Redirecting to home page in {countdown} seconds...
        </p>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Homepage Now
        </Link>
      </div>
    </div>
  );
}
