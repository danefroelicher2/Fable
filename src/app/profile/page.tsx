"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FollowStats from "@/components/FollowStats";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  social_links?: {
    instagram?: string | null;
    facebook?: string | null;
    x?: string | null;
  } | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [instagramLink, setInstagramLink] = useState<string>("");
  const [facebookLink, setFacebookLink] = useState<string>("");
  const [xLink, setXLink] = useState<string>("");
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
      router.push("/signin?redirect=" + encodeURIComponent("/profile"));
      return;
    }
  }, [user, router, loading]);

  // Handle avatar change
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

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        console.log("Loading profile for user:", user.id);

        try {
          // First try to fetch with the assumption social_links exists
          const { data, error } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, social_links")
            .eq("id", user.id)
            .single();

          if (error) {
            // If there's an error about the column, fall back to basic profile fetch
            if (
              error.message.includes("column 'social_links' does not exist")
            ) {
              const { data: basicData, error: basicError } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url")
                .eq("id", user.id)
                .single();

              if (basicError) throw basicError;

              // Set profile with a default social_links object
              const profileWithLinks = {
                ...basicData,
                social_links: { instagram: null, facebook: null, x: null },
              };

              setProfile(profileWithLinks);
              setUsername(profileWithLinks.username || "");
              setFullName(profileWithLinks.full_name || "");
              setAvatarUrl(profileWithLinks.avatar_url || "");
            } else {
              // For any other error, throw it
              throw error;
            }
          } else {
            // If data is successfully fetched
            setProfile(data || null);
            setUsername(data.username || "");
            setFullName(data.full_name || "");
            setAvatarUrl(data.avatar_url || "");
          }

          // Initialize social links if they exist
          if (profile?.social_links) {
            setInstagramLink(profile.social_links.instagram || "");
            setFacebookLink(profile.social_links.facebook || "");
            setXLink(profile.social_links.x || "");
          }

          // Initialize bio from localStorage if available
          const savedBio = localStorage.getItem("userBio_" + user.id);
          setBio(savedBio || "");

          // Load published articles
          fetchUserArticles();
        } catch (e) {
          console.error("Error fetching profile:", e);
          setError("Failed to load profile data");
        }
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

      // Update fields in the database - first without social_links
      const baseUpdates = {
        username,
        full_name: fullName,
        avatar_url: newAvatarUrl,
      };

      const { error } = await supabase
        .from("profiles")
        .update(baseUpdates)
        .eq("id", user.id);

      if (error) throw error;

      // Try to update social links separately (to handle if the column doesn't exist)
      try {
        // Create social links object
        const socialLinks = {
          instagram: instagramLink.trim(),
          facebook: facebookLink.trim(),
          x: xLink.trim(),
        };

        const { error: socialLinksError } = await supabase
          .from("profiles")
          .update({ social_links: socialLinks })
          .eq("id", user.id);

        // If there's an error, we just log it but don't break the flow
        if (socialLinksError) {
          console.warn(
            "Could not update social_links:",
            socialLinksError.message
          );
        }
      } catch (socialError) {
        console.warn("Social links update failed:", socialError);
        // Don't rethrow - we still want to consider the profile update successful
      }

      // Store bio in localStorage since it's not in the DB
      if (bio) {
        localStorage.setItem("userBio_" + user.id, bio);
      } else {
        localStorage.removeItem("userBio_" + user.id);
      }

      // Refresh the profile data, but don't fail if social_links column doesn't exist
      try {
        const { data, error: refreshError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, social_links")
          .eq("id", user.id)
          .single();

        if (refreshError) {
          console.warn("Could not refresh profile:", refreshError.message);
        } else if (data) {
          setProfile(data);
          setUsername(data.username || "");
          setFullName(data.full_name || "");

          if (data.social_links) {
            setInstagramLink(data.social_links.instagram || "");
            setFacebookLink(data.social_links.facebook || "");
            setXLink(data.social_links.x || "");
          }

          setAvatarUrl(data.avatar_url || "");
        }
      } catch (refreshError) {
        console.warn(
          "Could not refresh profile with social_links:",
          refreshError
        );

        // Fallback to fetching without social_links
        try {
          const { data, error: basicRefreshError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", user.id)
            .single();

          if (basicRefreshError) {
            console.warn(
              "Could not refresh basic profile:",
              basicRefreshError.message
            );
          } else if (data) {
            setProfile({
              ...data,
              social_links: profile?.social_links || null,
            });
            setUsername(data.username || "");
            setFullName(data.full_name || "");
            setAvatarUrl(data.avatar_url || "");
          }
        } catch (err) {
          console.error("Unexpected error refreshing basic profile:", err);
        }
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

  // Helper to format social links for display
  const formatSocialLinks = (links: any) => {
    if (!links) return [];

    const formattedLinks = [];

    if (links.instagram) {
      formattedLinks.push({
        name: "Instagram",
        url: links.instagram.startsWith("http")
          ? links.instagram
          : `https://instagram.com/${links.instagram}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      });
    }

    if (links.facebook) {
      formattedLinks.push({
        name: "Facebook",
        url: links.facebook.startsWith("http")
          ? links.facebook
          : `https://facebook.com/${links.facebook}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
          </svg>
        ),
      });
    }

    if (links.x) {
      formattedLinks.push({
        name: "X",
        url: links.x.startsWith("http")
          ? links.x
          : `https://twitter.com/${links.x}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        ),
      });
    }

    return formattedLinks;
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

              {/* Social Media Links Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-xl font-bold mb-3">Social Media Links</h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="instagramLink"
                    >
                      Instagram
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        instagram.com/
                      </span>
                      <input
                        id="instagramLink"
                        type="text"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        className="flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter just your username or the full URL
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="facebookLink"
                    >
                      Facebook
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        facebook.com/
                      </span>
                      <input
                        id="facebookLink"
                        type="text"
                        value={facebookLink}
                        onChange={(e) => setFacebookLink(e.target.value)}
                        className="flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username or page"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter just your username or the full URL
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="xLink"
                    >
                      X (Twitter)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        twitter.com/
                      </span>
                      <input
                        id="xLink"
                        type="text"
                        value={xLink}
                        onChange={(e) => setXLink(e.target.value)}
                        className="flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="username"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter just your username or the full URL
                    </p>
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

              <div className="flex space-x-4">
                {formatSocialLinks(profile.social_links).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2">{link.icon}</span>
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>

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
