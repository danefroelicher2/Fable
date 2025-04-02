// src/components/UserPosts.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Inline version of getUserPosts to avoid import issues
async function getUserPosts() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view your posts");
    }

    // Use type assertion with 'any' to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("posts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserPosts:", err);
    throw err;
  }
}

export default function UserPosts() {
  // Rest of your component code...
}
