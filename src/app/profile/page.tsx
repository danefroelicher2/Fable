"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setUsername(data.username || "");
          setFullName(data.full_name || "");
          setWebsite(data.website || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
        setError("Failed to load profile data");
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

      const updates = {
        id: user.id,
        username,
        full_name: fullName,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      setMessage("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white text-3xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                user?.email?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="website">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="avatarUrl">
                Avatar URL
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition"
            >
              {loading ? "Loading..." : "Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
