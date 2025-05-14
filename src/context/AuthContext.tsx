// src/context/AuthContext.tsx
"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  initializeAccountSwitching,
  captureAuthSession,
} from "@/lib/accountSwitcher";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // First check if we need to switch accounts
        const switched = await initializeAccountSwitching();

        // Then get the current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);

          // Capture the refresh token for future account switching
          if (data.session.user) {
            await captureAuthSession(data.session.user.id);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);

        // Capture refresh token on auth changes too
        if (currentSession.user) {
          await captureAuthSession(currentSession.user.id);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);

      // Force a router refresh when auth changes to ensure protected routes are updated
      router.refresh();
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }

      // These should be updated by the auth state change listener,
      // but we'll set them here too for immediate UI feedback
      setUser(null);
      setSession(null);

      // Redirect to home page after sign out
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, signOut, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
