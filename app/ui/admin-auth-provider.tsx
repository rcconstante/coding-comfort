"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { useConvex } from "convex/react";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const client = useConvex();
  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
