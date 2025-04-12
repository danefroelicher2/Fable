// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  // Keep bio in state only (not in DB)
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "stats">("articles");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !loading) {
      // Redirect to signin page if not authenticated
      router.push("/signin?redirect=" + encodeURIComponent("/profile"));
      return;
    }
  }, [user, router, loading]);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        console.log("Loading profile for user:", user.id);

        // Check if profile exists
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          // If error is not 'not found', throw it
          if (error.code !== "PGRST116") {
            console.error("Error fetching profile:", error);
            throw error;
          }

          console.log("Profile not found, creating a new one");

          // Create a new profile if one doesn't exist
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: "",
              full_name: "",
              avatar_url: "",
            });

          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }

          // Set default values
          const defaultProfile: Profile = {
            id: user.id,
            username: null,
            full_name: null,
            avatar_url: null,
          };

          setProfile(defaultProfile);
        } else if (data) {
          console.log("Profile loaded successfully:", data);
          // Profile exists, set the data
          setProfile(data);
          setUsername(data.username || "");
          setFullName(data.full_name || "");

          // Initialize bio from localStorage if available
          const savedBio = localStorage.getItem("userBio_" + user.id);
          setBio(savedBio || "");

          setAvatarUrl(data.avatar_url || "");
        }

        // Load published articles
        fetchUserArticles();
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
        setError("Failed to load profile data: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function fetchUserArticles() {
    if (!user) return;

    try {
      setIsLoadingArticles(true);
      console.log("Fetching articles for user:", user.id);

      // Fetch articles from public_articles table
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id, 
          title, 
          slug, 
          excerpt, 
          category, 
          published_at, 
          view_count,
          image_url
        `
        )
        .eq("user_id", user.id)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6); // Limit to 6 articles for the grid

      if (error) {
        console.error("Error fetching articles:", error);
        throw error;
      }

      console.log("Articles loaded:", data?.length || 0);
      setArticles(data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsLoadingArticles(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      if (!user) throw new Error("No user");

      // Upload avatar if a new file is selected
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        newAvatarUrl = urlData.publicUrl;
      }

      // Update fields in the database
      const updates = {
        username,
        full_name: fullName,
        avatar_url: newAvatarUrl,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Store bio in localStorage since it's not in the DB
      if (bio) {
        localStorage.setItem("userBio_" + user.id, bio);
      } else {
        localStorage.removeItem("userBio_" + user.id);
      }

      // Refresh the profile data
      const { data, error: refreshError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (refreshError) throw refreshError;

      if (data) {
        setProfile(data);
        setUsername(data.username || "");
        setFullName(data.full_name || "");
        // Bio is already set in state
        setAvatarUrl(data.avatar_url || "");
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setError("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setAvatarFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // View public profile function
  const viewPublicProfile = () => {
    if (user) {
      window.open(`/user/${user.id}`, "_blank");
    }
  };

  // Format date (e.g., "Mar 15, 2024")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  // If no user is found, redirect handled by useEffect
  if (!user) {
    return null;
  }

  // If editing, show edit form
  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
              <div
                className="h-48 w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden cursor-pointer hover:opacity-90 relative"
                onClick={triggerFileInput}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 text-white transition-opacity">
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                Upload new photo
              </button>
            </div>

            <div className="md:w-2/3 md:pl-8 space-y-4">
              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter a unique username"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="bio"
                >
                  Bio (Stored locally in your browser)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                  placeholder="Tell us about yourself"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your bio will be stored locally in your browser, not in the
                  database
                </p>
              </div>

              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You cannot change your email address
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show profile view
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Your Profile</h1>
            <div className="flex space-x-3">
              <button
                onClick={viewPublicProfile}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                View Public Profile
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
              <div className="h-48 w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>

            <div className="md:w-2/3 md:pl-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {fullName || username || "Anonymous User"}
                </h2>
                {username && <p className="text-gray-600">@{username}</p>}
              </div>

              {bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-700">{user?.email}</p>
              </div>

              <div className="flex space-x-4">
                <Link
                  href="/write"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  Write New Article
                </Link>
                <Link
                  href="/profile/drafts"
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                >
                  Saved Drafts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "articles"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("articles")}
            >
              Published Articles
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "stats"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("stats")}
            >
              Stats & Activity
            </button>
          </div>

          <div className="p-6">
            {activeTab === "articles" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Your Published Articles
                  </h2>
                </div>

                {isLoadingArticles ? (
                  <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                          <div className="h-48 bg-slate-200"></div>
                          <div className="p-4">
                            <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <p className="text-gray-600 mb-4">
                      You haven't published any articles yet.
                    </p>
                    <Link
                      href="/write"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Write Your First Article
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Instagram-style grid of articles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block aspect-square bg-gray-100 relative overflow-hidden group"
                        >
                          {/* Square Article Thumbnail */}
                          <div className="w-full h-full bg-slate-200 relative">
                            {article.image_url ? (
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 p-4">
                                <p className="text-center font-medium">
                                  {article.title}
                                </p>
                              </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                              <h3 className="font-bold text-center mb-2 line-clamp-2">
                                {article.title}
                              </h3>

                              <div className="flex items-center space-x-3 mt-2">
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {article.view_count}
                                </span>
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {article.like_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {articles.length > 0 && (
                      <div className="mt-6 text-center">
                        <Link
                          href={user ? `/user/${user.id}/articles` : "#"}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All Published Articles →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Stats & Activity</h2>

                {/* Simple stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {articles.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {articles.length === 1
                        ? "Article Published"
                        : "Articles Published"}
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {articles.reduce(
                        (sum, article) => sum + (article.view_count || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Views
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {articles.reduce(
                        (sum, article) => sum + (article.like_count || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Likes
                    </div>
                  </div>
                </div>

                {/* Recent activity list */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Recent Activity
                  </h3>
                  {articles.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600">
                        No recent activity to display.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {articles.slice(0, 5).map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">{article.title}</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-500">
                              Published on {formatDate(article.published_at)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {article.view_count} views
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
