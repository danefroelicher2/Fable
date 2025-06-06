// src/app/layout.tsx - RESPONSIVE VERSION WITH MOBILE NAV
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SidebarNav from "@/components/SidebarNav";
import MobileNavigation from "@/components/MobileNavigation";
import { MessageBadgeProvider } from "@/context/MessageBadgeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FABLE - History, Wars, People, and More",
  description:
    "Exploring historical events, figures, wars, eras through in-depth articles and analyses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* MOBILE VIEWPORT META TAG - CRITICAL FOR MOBILE */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            <MessageBadgeProvider>
              {/* RESPONSIVE LAYOUT */}
              <div className="flex min-h-screen max-w-full overflow-x-hidden">
                {/* DESKTOP SIDEBAR - Hidden on mobile */}
                <div className="fixed left-0 top-0 bottom-0 w-64 z-30 hidden lg:block">
                  <SidebarNav />
                </div>

                {/* MAIN CONTENT - Responsive margins */}
                <main className="flex-1 lg:ml-64 min-w-0 max-w-full overflow-x-hidden pb-20 lg:pb-0">
                  <div className="w-full max-w-full overflow-x-hidden">
                    {children}
                  </div>
                </main>

                {/* MOBILE NAVIGATION - Hidden on desktop */}
                <div className="lg:hidden">
                  <MobileNavigation />
                </div>
              </div>
            </MessageBadgeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
