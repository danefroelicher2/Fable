// src/components/ProfileNavLink.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProfileNavLinkProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function ProfileNavLink({
  children,
  className = "",
  icon,
}: ProfileNavLinkProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      // Redirect to sign in if not logged in
      router.push(`/signin?redirect=${encodeURIComponent("/profile")}`);
      return;
    }

    // Navigate to user's public profile
    router.push(`/user/${user.id}`);
  };

  return (
    <button onClick={handleClick} className={className}>
      {icon && <span className="mr-4">{icon}</span>}
      {children}
    </button>
  );
}
