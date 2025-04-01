// src/components/UserProfile.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        if (!user) throw new Error("No user");

        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, website, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUsername(data.username || "");
          setFullName(data.full_name || "");
          setWebsite(data.website || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user]);

  async function updateProfile() {
    try {
      setLoading(true);
      setUpdateSuccess(false);
      setUpdateError(null);

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

      setUpdateSuccess(true);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setUpdateError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Profile updated successfully!
        </div>
      )}

      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {updateError}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl">
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

        <div className="mb-4">
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
          <p className="text-sm text-gray-500 mt-1">
            You cannot change your email address
          </p>
        </div>

        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
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
          <p className="text-sm text-gray-500 mt-1">
            Enter a URL for your avatar image
          </p>
        </div>

        <button
          onClick={updateProfile}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
}
