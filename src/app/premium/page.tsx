// src/app/premium/page.tsx
"use client";

export default function PremiumPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Features
          </h1>

          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold text-lg mb-6 shadow-md">
            Coming Soon
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're working hard to bring you exclusive premium features that will
            enhance your storytelling experience.
          </p>

          <div className="space-y-4 text-left max-w-md mx-auto mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-gray-700">
                Image Upload within articles
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-gray-700">Writing statistics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-gray-700">Rich text editing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-gray-700">And more...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
