import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { AdminAuthProvider } from "../ui/admin-auth-provider";

async function ResearcherAuth({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <ConvexAuthNextjsServerProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
export const metadata: Metadata = {
  title: "Researcher access | Coding Comfort",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ResearcherAuth>{children}</ResearcherAuth>
    </Suspense>
  );
}
