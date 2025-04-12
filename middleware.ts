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
    if (
      path === "/profile" ||
      path.startsWith("/profile/") ||
      path === "/write" ||
      path.startsWith("/write/")
    ) {
      // Special case: Don't require auth for public user profile pages
      // This fixes the redirect loop issue
      if (path.startsWith("/profile/")) {
        const segments = path.split("/");

        // If this is a user ID page (like /profile/123-456-789) and not just /profile
        // or a specific feature like /profile/drafts
        if (segments.length > 2 && segments[2]?.includes("-")) {
          // Allow access to public user profile pages without authentication
          return res;
        }
      }

      // All other profile and write routes require authentication
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Redirect unauthenticated users to the login page with return URL
        const redirectUrl = new URL("/signin", req.url);
        redirectUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(redirectUrl);
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
  matcher: ["/profile", "/profile/:path*", "/write", "/write/:path*"],
};
