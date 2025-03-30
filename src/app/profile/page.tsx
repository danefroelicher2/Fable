// src/app/profile/page.tsx
"use client";

import UserProfile from "@/components/UserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
