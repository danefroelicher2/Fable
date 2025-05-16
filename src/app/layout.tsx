// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SidebarNav from "@/components/SidebarNav";

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
    "Exploring historical events, figures, wars, and eras through in-depth articles and analyses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 h-full`}
      >
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen">
              {/* Sidebar Navigation */}
              <SidebarNav />

              {/* Main Content */}
              <main className="flex-1 md:ml-64 pt-4 pb-12 w-full overflow-auto">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
