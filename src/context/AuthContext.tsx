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
import { storeAccount } from "@/lib/accountManager";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  switchAccount: async () => false,
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

        if (switched) {
          console.log("Successfully switched accounts during initialization");
        }

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

            // Get user profile to store account data
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("username, full_name, avatar_url")
                .eq("id", data.session.user.id)
                .single();

              // Store account data
              if (profileData) {
                storeAccount({
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  username: profileData.username,
                  full_name: profileData.full_name,
                  avatar_url: profileData.avatar_url,
                });
              }
            } catch (profileError) {
              console.warn(
                "Error fetching profile during auth init:",
                profileError
              );
            }
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
      console.log("Auth state changed:", event);

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

  const switchAccount = async (accountId: string) => {
    try {
      // Check if we're already using this account
      if (user?.id === accountId) {
        console.log("Already signed in with this account");
        return true;
      }

      // Store the target account ID in localStorage and redirect to sign-in page
      localStorage.setItem("switchToAccountId", accountId);

      // Sign out current user first
      await supabase.auth.signOut();

      // Redirect only needed if the automatic account switching fails
      // The AuthContext will attempt to switch accounts on initialization

      // Return true to indicate successful initiation of account switch
      return true;
    } catch (error) {
      console.error("Error initiating account switch:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        refreshSession,
        switchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
