"use client";

import dynamic from "next/dynamic";

// Dynamically import the real sidebar content (client-only)
const ClientSidebarContent = dynamic(() => import("./ClientSidebarContent"), {
  ssr: false,
});

export default function ClientSidebar() {
  return <ClientSidebarContent />;
}
