// src/app/layout.tsx - FIXED VERSION - No Horizontal Scroll
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SidebarNav from "@/components/SidebarNav";
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
  title: "LOSTLIBRARY - History, Wars, People, and More",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            <MessageBadgeProvider>
              {/* FIXED: Layout with proper overflow handling */}
              <div className="flex min-h-screen max-w-full overflow-x-hidden">
                {/* Sidebar - Fixed positioning to prevent content overflow */}
                <div className="fixed left-0 top-0 bottom-0 w-64 z-30">
                  <SidebarNav />
                </div>

                {/* Main content area - Proper spacing and overflow control */}
                <main className="flex-1 ml-64 min-w-0 max-w-full overflow-x-hidden">
                  <div className="w-full max-w-full overflow-x-hidden">
                    {children}
                  </div>
                </main>
              </div>
            </MessageBadgeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
