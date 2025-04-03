// src/app/write/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");

  // If user is not signed in, show sign-in prompt
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-6">Write an Article</h1>
          <p className="mb-6">
            You need to sign in to write articles on LOSTLIBRARY.
          </p>
          <Link
            href={`/signin?redirect=${encodeURIComponent("/write")}`}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Write a New Article</h1>

        <form className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter a compelling title for your article"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="excerpt"
              className="block text-gray-700 font-medium mb-2"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Provide a brief summary of your article (will appear in previews)"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select a category</option>
              <option value="ancient-history">Ancient History</option>
              <option value="medieval-period">Medieval Period</option>
              <option value="renaissance">Renaissance</option>
              <option value="early-modern-period">Early Modern Period</option>
              <option value="industrial-age">Industrial Age</option>
              <option value="20th-century">20th Century</option>
              <option value="world-wars">World Wars</option>
              <option value="cold-war-era">Cold War Era</option>
              <option value="modern-history">Modern History</option>
            </select>
          </div>

          <div className="mb-8">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={15}
              placeholder="Write your article here..."
              required
            />
            <p className="text-gray-500 text-sm mt-2">
              Tip: Use Markdown for formatting. *italic* for italics, **bold**
              for bold, # for headings.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Save as Draft
            </button>

            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
