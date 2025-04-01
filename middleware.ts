// src/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

    // Get the current path
    const path = req.nextUrl.pathname;

    // Check if the path requires authentication
    if (path.startsWith("/profile")) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Redirect unauthenticated users to the login page
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }

    return res;
  } catch (e) {
    console.error("Middleware error:", e);
    return res;
  }
}

// Only run middleware on protected routes
export const config = {
  matcher: ["/profile/:path*"],
};
