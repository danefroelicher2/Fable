// src/components/ProfileNavLink.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ReactNode } from "react";

interface ProfileNavLinkProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export default function ProfileNavLink({
  children,
  className = "",
  icon,
}: ProfileNavLinkProps) {
  const { user } = useAuth();

  // Create the target URL - if user is logged in, go to public profile
  // Otherwise go to signin page
  const href = user ? `/user/${user.id}` : "/signin?redirect=/profile";

  return (
    <Link href={href} className={className}>
      {icon && <span className="mr-4">{icon}</span>}
      {children}
    </Link>
  );
}
