// src/app/write/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { saveDraft, Draft, publishDraft } from "@/lib/draftUtils";
import ImageUpload from "@/components/ImageUpload";

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  // Scroll to top when message or error is shown
  useEffect(() => {
    if ((message || error) && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message, error]);

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

  const generateSlug = (titleText: string) => {
    if (!titleText) return "";
    return (
      titleText
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-6)
    );
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError("Please enter a title before saving");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const draftData: Draft = {
        title,
        content,
        excerpt:
          content.substring(0, 150) + (content.length > 150 ? "..." : ""),
        category: "general",
        image_url: coverImage,
        slug: generateSlug(title),
      };

      const savedDraft = await saveDraft(draftData);

      if (savedDraft) {
        setMessage("Draft saved successfully!");

        // Optionally, redirect to drafts page after a delay
        setTimeout(() => {
          setMessage("");
          // Uncomment the line below if you want to redirect after saving
          // router.push("/profile/drafts");
        }, 3000);
      } else {
        setError("Failed to save draft. Please try again.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("An error occurred while saving draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in title and content before publishing");
      return;
    }

    setIsPublishing(true);
    setError("");
    setMessage("");

    try {
      // Auto-generate these values
      const draftSlug = generateSlug(title);
      const autoExcerpt =
        content.length > 150 ? content.substring(0, 150) + "..." : content;

      // Save as draft first
      const draftData: Draft = {
        title,
        content,
        excerpt: autoExcerpt,
        category: "general", // Default category
        image_url: coverImage,
        slug: draftSlug,
      };

      const savedDraft = await saveDraft(draftData);

      if (!savedDraft || !savedDraft.id) {
        throw new Error("Failed to save draft before publishing");
      }

      // Now publish the draft
      const published = await publishDraft(savedDraft);

      if (published) {
        setPublishedId(published);
        setMessage(
          "Article published successfully! Redirecting to your profile..."
        );
        setIsRedirecting(true);

        // Scroll to message
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // Redirect to the profile page after a delay
        setTimeout(() => {
          router.push("/profile");
        }, 2500);
      } else {
        throw new Error("Failed to publish article");
      }
    } catch (error: any) {
      console.error("Error publishing article:", error);
      setError("Error publishing article: " + error.message);
      setIsRedirecting(false);
    } finally {
      setIsPublishing(false);
    }
  };

  // Function to handle inserting an image into the content
  const handleInsertImage = (imageUrl: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      // Create markdown image syntax
      const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`;

      // Insert at cursor position
      const newContent =
        content.substring(0, startPos) +
        imageMarkdown +
        content.substring(endPos);

      setContent(newContent);

      // Set cursor position after the inserted image
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          startPos + imageMarkdown.length,
          startPos + imageMarkdown.length
        );
      }, 0);
    } else {
      // If no cursor position, just append to the end
      setContent(content + `\n\n![Image](${imageUrl})\n\n`);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Write a New Article</h1>

        <div ref={messageRef}>
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {message}
              {isRedirecting && (
                <div className="mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-700 mr-2"></div>
                  <span>Redirecting...</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

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
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter a compelling title for your article"
              required
              disabled={isRedirecting}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Cover Image
            </label>
            <div className="flex flex-col md:flex-row md:items-start">
              {coverImage && (
                <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-auto rounded border border-gray-200"
                  />
                </div>
              )}
              <div className={coverImage ? "md:w-2/3" : "w-full"}>
                {!isRedirecting ? (
                  <ImageUpload
                    onImageUploaded={(url) => setCoverImage(url)}
                    bucketName="article-images"
                    folderPath="{userId}/covers/{timestamp}"
                    buttonLabel="Upload Cover Image"
                    acceptedTypes="image/jpeg,image/png,image/webp"
                    maxSize={2} // 2MB
                    showPreview={false}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="bg-gray-300 text-gray-600 px-4 py-2 rounded opacity-50 cursor-not-allowed"
                  >
                    Upload Cover Image
                  </button>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  Upload an eye-catching cover image for your article (max 2MB,
                  JPEG or PNG)
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="content"
                className="block text-gray-700 font-medium"
              >
                Content
              </label>
              <div>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                  onClick={() => {
                    if (editorRef.current) {
                      const textarea = editorRef.current;
                      const startPos = textarea.selectionStart;
                      const endPos = textarea.selectionEnd;
                      const selectedText = content.substring(startPos, endPos);

                      // If text is selected, wrap it in bold markdown
                      if (startPos !== endPos) {
                        const newContent =
                          content.substring(0, startPos) +
                          `**${selectedText}**` +
                          content.substring(endPos);

                        setContent(newContent);
                      } else {
                        // If no selection, insert placeholder
                        const newContent =
                          content.substring(0, startPos) +
                          "**bold text**" +
                          content.substring(endPos);

                        setContent(newContent);
                      }
                    }
                  }}
                  disabled={isRedirecting}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                  onClick={() => {
                    if (editorRef.current) {
                      const textarea = editorRef.current;
                      const startPos = textarea.selectionStart;
                      const endPos = textarea.selectionEnd;
                      const selectedText = content.substring(startPos, endPos);

                      // If text is selected, wrap it in italic markdown
                      if (startPos !== endPos) {
                        const newContent =
                          content.substring(0, startPos) +
                          `*${selectedText}*` +
                          content.substring(endPos);

                        setContent(newContent);
                      } else {
                        // If no selection, insert placeholder
                        const newContent =
                          content.substring(0, startPos) +
                          "*italic text*" +
                          content.substring(endPos);

                        setContent(newContent);
                      }
                    }
                  }}
                  disabled={isRedirecting}
                >
                  Italic
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => {
                    if (editorRef.current) {
                      const textarea = editorRef.current;
                      const startPos = textarea.selectionStart;

                      // Insert heading at the beginning of the line
                      const lineStart =
                        content.lastIndexOf("\n", startPos - 1) + 1;
                      const newContent =
                        content.substring(0, lineStart) +
                        "## " +
                        content.substring(lineStart);

                      setContent(newContent);
                    }
                  }}
                  disabled={isRedirecting}
                >
                  Heading
                </button>
              </div>
            </div>

            <div className="mb-2">
              {!isRedirecting ? (
                <ImageUpload
                  onImageUploaded={handleInsertImage}
                  bucketName="article-images"
                  folderPath="{userId}/content/{timestamp}"
                  buttonLabel="Insert Image"
                  className="mb-2"
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="bg-gray-300 text-gray-600 px-4 py-2 rounded opacity-50 cursor-not-allowed mb-2"
                >
                  Insert Image
                </button>
              )}
            </div>

            <textarea
              id="content"
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={15}
              placeholder="Write your article here..."
              required
              disabled={isRedirecting}
            />
            <p className="text-gray-500 text-sm mt-2">
              Tip: Use Markdown for formatting. *italic* for italics, **bold**
              for bold, ## for headings.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving || isRedirecting}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isRedirecting}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
