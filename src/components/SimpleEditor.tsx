// src/components/SimpleEditor.tsx
"use client";

import { useState } from "react";

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SimpleEditor({ value, onChange }: SimpleEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const renderMarkdown = (text: string) => {
    // Very simple markdown rendering (you might want to use a proper library)
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/# (.*?)$/gm, "<h1>$1</h1>") // H1
      .replace(/## (.*?)$/gm, "<h2>$1</h2>") // H2
      .replace(/### (.*?)$/gm, "<h3>$1</h3>") // H3
      .replace(/\n/g, "<br />"); // Line breaks

    return html;
  };

  return (
    <div className="border rounded">
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setPreviewMode(false)}
          className={`px-4 py-2 ${!previewMode ? "bg-gray-200" : "bg-white"}`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className={`px-4 py-2 ${previewMode ? "bg-gray-200" : "bg-white"}`}
        >
          Preview
        </button>
      </div>

      {previewMode ? (
        <div
          className="p-4 min-h-[300px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 min-h-[300px] focus:outline-none"
          placeholder="Write your article here..."
        />
      )}

      <div className="border-t p-2 bg-gray-50 text-sm text-gray-600">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onChange(value + "**bold**")}
            className="px-2 py-1 bg-white border rounded"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => onChange(value + "*italic*")}
            className="px-2 py-1 bg-white border rounded italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => onChange(value + "# Heading")}
            className="px-2 py-1 bg-white border rounded"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => onChange(value + "## Subheading")}
            className="px-2 py-1 bg-white border rounded"
          >
            H2
          </button>
        </div>
      </div>
    </div>
  );
}
