"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function MinimalSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
      <div className="text-xl font-bold mb-6">Your Site</div>
      <nav>
        <Link href="/" className={pathname === "/" ? "font-bold" : ""}>
          Home
        </Link>
      </nav>
    </div>
  );
}
