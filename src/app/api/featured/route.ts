// src/app/api/featured/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "3b398d8a-11de-4066-a7d6-091c21647ecb";

export async function POST(request: Request) {
  try {
    // Get user session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (sessionData.session.user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const { articleId, position } = await request.json();

    if (!articleId || !position || position < 1 || position > 5) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // First check if the position is already occupied
    // Using type assertion to bypass TypeScript checking
    const { data: existing } = await (supabase as any)
      .from("featured_articles")
      .select("id")
      .eq("position", position)
      .single();

    // If position is occupied, delete the existing entry
    if (existing) {
      await (supabase as any)
        .from("featured_articles")
        .delete()
        .eq("position", position);
    }

    // Insert the new featured article
    // Using type assertion to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("featured_articles")
      .insert({
        article_id: articleId,
        position: position,
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error setting featured article:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

// Add a DELETE endpoint to remove from featured
export async function DELETE(request: Request) {
  try {
    // Similar authentication checks as above
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (
      sessionError ||
      !sessionData.session ||
      sessionData.session.user.id !== ADMIN_USER_ID
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const position = url.searchParams.get("position");

    if (!position) {
      return NextResponse.json({ error: "Position required" }, { status: 400 });
    }

    // Remove the featured article
    // Using type assertion to bypass TypeScript checking
    const { error } = await (supabase as any)
      .from("featured_articles")
      .delete()
      .eq("position", position);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing featured article:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
