// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserPublishedArticles from "@/components/UserPublishedArticles";
import UserStats from "@/components/UserStats";
import Link from "next/link";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  // Remove bio field since it doesn't exist in your database
}

export default function ProfilePage() {
  const { user } = useAuth();
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

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        // Check if profile exists - don't select 'bio' field since it doesn't exist
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          // If error is not 'not found', throw it
          if (error.code !== "PGRST116") {
            throw error;
          }

          // Create a new profile if one doesn't exist - don't include 'bio' field
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: "",
              full_name: "",
              avatar_url: "",
            });

          if (createError) throw createError;

          // Set default values
          const defaultProfile: Profile = {
            id: user.id,
            username: null,
            full_name: null,
            avatar_url: null,
          };

          setProfile(defaultProfile);
        } else if (data) {
          // Profile exists, set the data
          setProfile(data);
          setUsername(data.username || "");
          setFullName(data.full_name || "");
          // Initialize bio from localStorage if available
          const savedBio = localStorage.getItem("userBio_" + user.id);
          setBio(savedBio || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
        setError("Failed to load profile data: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

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

      // Update fields that exist in the database (not including bio)
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

  return (
    <ProtectedRoute>
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

        {loading && !isEditing ? (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3">Loading profile...</span>
          </div>
        ) : !isEditing ? (
          // Profile View Mode
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Profile</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
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
                    {user && (
                      <UserPublishedArticles
                        userId={user.id}
                        displayType="grid"
                      />
                    )}
                  </div>
                )}

                {activeTab === "stats" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      Stats & Activity
                    </h2>
                    {user && <UserStats userId={user.id} />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Profile Edit Mode
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
        )}
      </div>
    </ProtectedRoute>
  );
}
