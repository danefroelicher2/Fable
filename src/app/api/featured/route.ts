// src/app/api/featured/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create a fresh Supabase client for server-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    // Skip authentication for now - just for testing
    console.log("Featured API endpoint called");

    // Parse the request body
    const body = await request.json();
    console.log("Request body:", body);

    const { articleId, position } = body;

    if (!articleId || !position || position < 1 || position > 5) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    console.log(`Featuring article ${articleId} at position ${position}`);

    // For testing, just pretend it worked without actually updating the database
    return NextResponse.json({
      success: true,
      message: "Article featured successfully (test mode)",
      articleId,
      position,
    });
  } catch (error: any) {
    console.error("Error in featured API:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
