"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const { user, signOut, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to signin if not authenticated
      router.push("/signin");
      return;
    }

    // Load user profile data if user is logged in
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, bio")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (data) {
          setUsername(data.username || "");
          setFullName(data.full_name || "");
          setBio(data.bio || "");
        }
      };

      fetchProfile();
    }
  }, [user, isLoading, router]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        full_name: fullName,
        bio,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage("Profile updated successfully!");
    } catch (error: any) {
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="mb-6">
        <p className="text-gray-600">
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          {message}
        </div>
      )}

      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded h-32"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}
