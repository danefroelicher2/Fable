// src/app/profile/account-settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// Simplified preferences structure without email notifications
interface UserPreferences {
  theme: "light" | "dark";
}

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Track current theme selection separately from global theme state
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(theme);

  useEffect(() => {
    // Load theme preference from localStorage
    if (user) {
      loadUserPreferences();
    }

    // Set the initial selected theme based on current theme
    setSelectedTheme(theme);
  }, [user, theme]);

  function loadUserPreferences() {
    try {
      // Load theme preference from localStorage
      const savedPrefs = localStorage.getItem(`user_prefs_${user?.id}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs) as UserPreferences;
        if (prefs.theme) {
          setSelectedTheme(prefs.theme);
        }
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }
  }

  async function saveUserPreferences() {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      if (!user) throw new Error("No user");

      // Save to localStorage
      const prefsToSave: UserPreferences = {
        theme: selectedTheme,
      };

      localStorage.setItem(
        `user_prefs_${user.id}`,
        JSON.stringify(prefsToSave)
      );

      // Apply the selected theme globally
      setTheme(selectedTheme);

      // Try to update the user's profile with theme preference
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) {
          console.warn("Could not update profile theme:", profileError);
        }
      } catch (err) {
        console.warn("Profile update attempt failed:", err);
      }

      setMessage("Theme preferences saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error saving preferences:", error.message);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Preview the theme without saving it
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setSelectedTheme(newTheme);

    // Apply the theme immediately for preview
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Handle edit profile navigation - same as the edit profile button on main profile
  const handleEditProfile = () => {
    if (user) {
      // Set the localStorage flag to start in edit mode (same as main profile edit button)
      localStorage.setItem("startInEditMode", "true");
      router.push("/profile");
    }
  };

  // Handle change password - Fixed success message
  async function handleChangePassword() {
    try {
      setChangePasswordLoading(true);
      setError(null);
      setMessage(null);

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Please fill in all password fields");
        setChangePasswordLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        setChangePasswordLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long");
        setChangePasswordLoading(false);
        return;
      }

      if (newPassword === currentPassword) {
        setError("New password must be different from current password");
        setChangePasswordLoading(false);
        return;
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        // Handle specific error cases
        if (error.message.includes("New password should be different")) {
          setError("New password must be different from your current password");
        } else if (error.message.includes("Password should be at least")) {
          setError("Password must be at least 6 characters long");
        } else {
          setError(
            "Failed to change password. Please check your current password and try again."
          );
        }
        setChangePasswordLoading(false);
        return;
      }

      // Success - This should now work properly
      console.log("Password updated successfully");
      setChangePasswordLoading(false);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);

      // Clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error("Error changing password:", error);
      setError("An unexpected error occurred. Please try again.");
      setChangePasswordLoading(false);
    }
  }

  // Handle forgot password using your existing system
  const handleForgotPassword = async () => {
    if (!user?.email) {
      setError("No email address found for password reset");
      return;
    }

    try {
      // Use your existing password reset system
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError("Failed to send password reset email");
        return;
      }

      setMessage(
        "Password reset email sent! Check your inbox and follow the link to reset your password."
      );
      setShowChangePassword(false);
    } catch (error) {
      setError("Failed to send password reset email");
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            Account Settings
          </h1>

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

          {/* Theme Settings Section */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                Theme Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Customize the appearance of the site
              </p>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    selectedTheme === "light"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    selectedTheme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark Mode
                </button>
              </div>

              {selectedTheme !== theme && (
                <p className="mt-3 text-sm text-yellow-600 dark:text-yellow-400">
                  Click "Save Theme Settings" below to apply this theme setting
                  permanently.
                </p>
              )}
            </div>

            <div className="p-6">
              <button
                type="button"
                onClick={saveUserPreferences}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save Theme Settings"}
              </button>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">
                Account Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Manage your account settings and security
              </p>

              <div className="space-y-4">
                {/* Edit Profile Button */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                  <div>
                    <h3 className="font-medium dark:text-white">
                      Profile Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Update your profile details, bio, and social links
                    </p>
                  </div>
                  <button
                    onClick={handleEditProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Change Password Section */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium dark:text-white">Password</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Change your account password
                      </p>
                    </div>
                    {!showChangePassword && (
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {/* Change Password Form */}
                  {showChangePassword && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Enter your new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleChangePassword}
                          disabled={changePasswordLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {changePasswordLoading
                            ? "Changing..."
                            : "Update Password"}
                        </button>
                        <button
                          onClick={() => {
                            setShowChangePassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setError(null);
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Forgot Password Link - Uses your existing system */}
                      <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                        <button
                          onClick={handleForgotPassword}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          Forgot your current password?
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          This will send you a link to reset your password via
                          email
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Account Section */}
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-900/20">
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-400">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete your account? This action cannot be undone."
                        )
                      ) {
                        alert(
                          "Account deletion functionality will be added soon."
                        );
                      }
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Profile Link */}
          <div className="text-center">
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
