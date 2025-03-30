"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        router.refresh();
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    getSession();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}
