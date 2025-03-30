"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error refreshing session:", error);
        return;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Unexpected error refreshing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        console.log("User signed in, refreshing page");
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        // Navigate to home page after sign out
        router.push("/");
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
