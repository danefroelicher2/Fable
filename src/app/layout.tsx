// src/app/layout.tsx - FIXED VERSION
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <MessageBadgeProvider>
              {/* Layout with sidebar */}
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <SidebarNav />

                {/* Main content area */}
                <main className="flex-1 ml-64">{children}</main>
              </div>
            </MessageBadgeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
