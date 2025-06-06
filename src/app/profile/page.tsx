// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isUsernameAvailable } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FollowStats from "@/components/FollowStats";
import ManageFavorites from "@/components/ManageFavorites";
import ManagePinnedPosts from "@/components/ManagePinnedPosts";
import PinnedPosts from "@/components/PinnedPosts";
import { getFromStorage, setToStorage } from "@/lib/localStorageUtils";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  // Add social_links as an optional type to avoid TypeScript errors
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  } | null;
}

// Interface for social links
interface SocialLinks {
  twitter: string;
  github: string;
  linkedin: string;
  website: string;
}

/**
 * Validates username format
 * @param username The username to validate
 * @returns An error message if invalid, or null if valid
 */
function validateUsername(username: string): string | null {
  if (!username) return null; // Empty is fine, will be handled elsewhere

  // Remove @ if user enters it (we'll add it when displaying)
  const cleanUsername = username.startsWith("@")
    ? username.substring(1)
    : username;

  // Convert to lowercase for validation and check if original had uppercase
  const lowercaseUsername = cleanUsername.toLowerCase();
  const hadUppercase = cleanUsername !== lowercaseUsername;

  // Check for valid characters (only lowercase letters, numbers, underscores, hyphens)
  // Note: using a-z instead of a-zA-Z to enforce lowercase letters only
  if (!/^[a-z0-9_-]+$/.test(lowercaseUsername)) {
    return "Username can only contain lowercase letters, numbers, underscores, and hyphens";
  }

  // Check length (typically 3-30 characters)
  if (lowercaseUsername.length < 3) {
    return "Username must be at least 3 characters long";
  }

  if (lowercaseUsername.length > 30) {
    return "Username cannot be longer than 30 characters";
  }

  // Warning about uppercase conversion - you can remove this if you don't want to show this message
  if (hadUppercase) {
    // This isn't a validation error but a notification that uppercase will be converted
    console.log(
      "Username had uppercase letters that will be converted to lowercase"
    );
  }

  return null; // Valid
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const { theme: currentTheme } = useTheme();
  // Keep bio in state only (not in DB)
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "articles" | "favorites" | "stats" | "pinned"
  >("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Add social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    // Check if we should start in edit mode based on localStorage flag
    if (typeof window !== "undefined") {
      const startInEditMode = localStorage.getItem("startInEditMode");

      if (startInEditMode === "true") {
        // Set editing mode to true
        setIsEditing(true);

        // Clear the flag so it doesn't persist on page refresh
        localStorage.removeItem("startInEditMode");
      }
    }
  }, []);

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

          // Initialize social links from localStorage
          const savedSocialLinks = localStorage.getItem(
            "userSocialLinks_" + user.id
          );
          if (savedSocialLinks) {
            try {
              setSocialLinks(JSON.parse(savedSocialLinks));
            } catch (e) {
              console.error("Error parsing social links:", e);
            }
          }

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

  // Modified handleCancelEdit function to navigate to public profile
  const handleCancelEdit = () => {
    if (user) {
      // Navigate to the user's public profile page
      router.push(`/user/${user.id}`);
    } else {
      // Fallback to just disable edit mode if no user (shouldn't happen)
      setIsEditing(false);
    }
  };

  async function updateProfile() {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      if (!user) throw new Error("No user");

      // Validate username format if not empty
      if (username) {
        const usernameError = validateUsername(username);
        if (usernameError) {
          setError(usernameError);
          setLoading(false);
          return;
        }
      }

      // Clean the username (remove @ if user added it) and force lowercase
      const cleanUsername = (
        username.startsWith("@") ? username.substring(1) : username
      ).toLowerCase();

      // Check if username is available (if changed)
      if (cleanUsername && cleanUsername !== profile?.username?.toLowerCase()) {
        const isAvailable = await isUsernameAvailable(cleanUsername, user.id);
        if (!isAvailable) {
          setError(
            `Username @${cleanUsername} is already taken. Please choose another username.`
          );
          setLoading(false);
          return;
        }
      }

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
        username: cleanUsername, // Always store lowercase username without @
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

      // Store social links in localStorage as a temporary solution
      localStorage.setItem(
        "userSocialLinks_" + user.id,
        JSON.stringify(socialLinks)
      );

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
        // Bio and social links are already set in state
        setAvatarUrl(data.avatar_url || "");
      }

      setMessage("Profile updated successfully!");

      // NEW CODE: Redirect to public profile after a brief delay
      setTimeout(() => {
        // Navigate to the public profile
        router.push(`/user/${user.id}`);
      }, 1500); // 1.5 seconds delay to show the success message
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

  const handleSocialLinkChange = (
    platform: keyof SocialLinks,
    value: string
  ) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
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
            <h1 className="text-3xl font-bold text-black">Edit Profile</h1>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
              <div
                className="h-32 w-32 md:h-48 md:w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden cursor-pointer hover:opacity-90 relative"
                onClick={triggerFileInput}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar Preview"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="192px"
                  />
                ) : avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={username || "User"}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="192px"
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
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={
                      username.startsWith("@")
                        ? username.substring(1)
                        : username
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      // Clear username-related errors when user is typing
                      if (error && error.includes("Username")) {
                        setError(null);
                      }
                      setUsername(value);
                    }}
                    onBlur={(e) => {
                      // Validate on blur for better UX
                      const value = e.target.value;
                      if (value) {
                        const usernameError = validateUsername(value);
                        if (usernameError) {
                          setError(usernameError);
                        }
                      }
                    }}
                    className="w-full p-2 pl-8 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter a unique username"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your unique username that others will use to mention you
                </p>
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
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-gray-700 font-bold"
                    htmlFor="bio"
                  >
                    Bio
                  </label>
                  <div
                    className={`text-sm ${
                      bio.length > 225
                        ? "text-red-600 font-bold"
                        : bio.length > 200
                        ? "text-orange-500"
                        : "text-gray-500"
                    }`}
                  >
                    {bio.length}/225
                  </div>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    bio.length > 225
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  }`}
                  rows={4}
                  placeholder="Tell us about yourself"
                  maxLength={250} // Allow typing but we'll validate at 225
                />
                {bio.length > 225 && (
                  <p className="text-red-600 text-sm mt-1">
                    Bio must be 225 characters or fewer
                  </p>
                )}
              </div>

              {/* Social Links Section */}
              <div>
                <h3 className="block text-gray-700 font-bold mb-2">
                  Social Links
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      className="block text-gray-600 text-sm mb-1"
                      htmlFor="twitter"
                    >
                      Twitter
                    </label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-500">
                        twitter.com/
                      </span>
                      <input
                        id="twitter"
                        type="text"
                        value={socialLinks.twitter}
                        onChange={(e) =>
                          handleSocialLinkChange("twitter", e.target.value)
                        }
                        className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-600 text-sm mb-1"
                      htmlFor="github"
                    >
                      GitHub
                    </label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-500">
                        github.com/
                      </span>
                      <input
                        id="github"
                        type="text"
                        value={socialLinks.github}
                        onChange={(e) =>
                          handleSocialLinkChange("github", e.target.value)
                        }
                        className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-600 text-sm mb-1"
                      htmlFor="linkedin"
                    >
                      LinkedIn
                    </label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-500">
                        linkedin.com/in/
                      </span>
                      <input
                        id="linkedin"
                        type="text"
                        value={socialLinks.linkedin}
                        onChange={(e) =>
                          handleSocialLinkChange("linkedin", e.target.value)
                        }
                        className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-600 text-sm mb-1"
                      htmlFor="website"
                    >
                      Personal Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={socialLinks.website}
                      onChange={(e) =>
                        handleSocialLinkChange("website", e.target.value)
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
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
            <h1 className="text-3xl font-bold text-black">Edit Profile</h1>
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
              <div className="h-32 w-32 md:h-48 md:w-48 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={username || "User"}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 128px, 192px"
                  />
                ) : (
                  <span className="text-4xl md:text-6xl">
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
                {profile?.username && (
                  <p className="text-gray-600">@{profile.username}</p>
                )}
              </div>

              {bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                </div>
              )}

              {/* Social Links Display */}
              {(socialLinks.twitter ||
                socialLinks.github ||
                socialLinks.linkedin ||
                socialLinks.website) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-blue-500"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                        <span>@{socialLinks.twitter}</span>
                      </a>
                    )}

                    {socialLinks.github && (
                      <a
                        href={`https://github.com/${socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-gray-900"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>{socialLinks.github}</span>
                      </a>
                    )}

                    {socialLinks.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-blue-700"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"></path>
                        </svg>
                        <span>{socialLinks.linkedin}</span>
                      </a>
                    )}

                    {socialLinks.website && (
                      <a
                        href={
                          socialLinks.website.startsWith("http")
                            ? socialLinks.website
                            : `https://${socialLinks.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-green-700"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          ></path>
                        </svg>
                        <span>
                          {socialLinks.website.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Adding Follow Stats */}
              {user && (
                <div className="mb-6">
                  <FollowStats userId={user.id} />
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
          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Overview
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "favorites"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              Manage Favorites
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "pinned"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("pinned")}
            >
              Pinned Posts
            </button>
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
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                <p className="mb-4">
                  Your profile information is visible to other users. You can
                  edit your profile details by clicking the "Edit Profile"
                  button above.
                </p>
                <p className="mb-4">
                  Visit your public profile to see how others view your profile
                  page.
                </p>
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Manage Favorite Articles
                </h2>
                <ManageFavorites />
              </div>
            )}

            {activeTab === "pinned" && (
              <div>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: currentTheme === "dark" ? "black" : "black" }}
                >
                  Manage Pinned Posts
                </h2>
                <ManagePinnedPosts />
              </div>
            )}

            {activeTab === "articles" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "black !important" }}
                  >
                    Your Published Articles
                  </h2>
                  4
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
                    // In src/app/profile/page.tsx // Find the Instagram-style
                    grid of articles and update the hover overlay:
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
                              <Image
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="(max-width: 768px) 50vw, 33vw"
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
                                  {article.view_count || 0} views
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
