// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HistoryNet - History, Wars, People, and More",
  description:
    "Exploring historical events, figures, wars, and eras through in-depth articles and analyses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Navigation />
            <main className="pb-12">{children}</main>

            {/* Footer component would go here */}
            <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">About Us</h3>
                    <p className="text-gray-300">
                      HistoryNet is your destination for exploring historical
                      events, wars, famous people, and more through in-depth
                      articles and analysis.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Categories</h3>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="/wars-events"
                          className="text-gray-300 hover:text-white"
                        >
                          Wars & Events
                        </a>
                      </li>
                      <li>
                        <a
                          href="/famous-people"
                          className="text-gray-300 hover:text-white"
                        >
                          Famous People
                        </a>
                      </li>
                      <li>
                        <a
                          href="/eras"
                          className="text-gray-300 hover:text-white"
                        >
                          Historical Eras
                        </a>
                      </li>
                      <li>
                        <a
                          href="/topics"
                          className="text-gray-300 hover:text-white"
                        >
                          Special Topics
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Connect</h3>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="/newsletters"
                          className="text-gray-300 hover:text-white"
                        >
                          Newsletters
                        </a>
                      </li>
                      <li>
                        <a
                          href="/podcasts"
                          className="text-gray-300 hover:text-white"
                        >
                          Podcasts
                        </a>
                      </li>
                      <li>
                        <a
                          href="/contact"
                          className="text-gray-300 hover:text-white"
                        >
                          Contact Us
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Subscribe</h3>
                    <form className="mt-4">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="px-4 py-2 w-full text-gray-800 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <button
                        type="submit"
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 w-full rounded-md transition"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                  <p>
                    © {new Date().getFullYear()} HistoryNet. All Rights
                    Reserved.
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
