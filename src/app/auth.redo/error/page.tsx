"use client";

import Link from "next/link";

export default function AuthError() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <svg
          className="w-20 h-20 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>

        <p className="text-lg mb-6">
          We encountered an error while trying to authenticate your account.
          This might be because the confirmation link has expired or is invalid.
        </p>

        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Sign In
          </Link>

          <Link href="/" className="inline-block text-blue-600 hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
