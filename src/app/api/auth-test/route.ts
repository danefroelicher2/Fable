// src/app/api/auth-test/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      return NextResponse.json({
        error: error.message,
        authenticated: false,
      });
    }

    if (!session) {
      return NextResponse.json({
        message: "No active session",
        authenticated: false,
      });
    }

    return NextResponse.json({
      message: "Authenticated",
      authenticated: true,
      userId: session.user.id,
      email: session.user.email,
    });
  } catch (error: any) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      error: error.message,
      authenticated: false,
    });
  }
}
