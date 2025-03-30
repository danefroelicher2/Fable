import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res });

    // This refreshes the user's session if they have one
    await supabase.auth.getSession();

    // Get the pathname
    const path = req.nextUrl.pathname;

    // Only protect the profile page - redirect to signin if not authenticated
    if (path.startsWith("/profile")) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Redirect to signin only for profile page when not authenticated
        const redirectUrl = new URL("/signin", req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return res;
  }
}

// Only run middleware on specific pages
export const config = {
  matcher: ["/profile/:path*", "/signin"],
};
