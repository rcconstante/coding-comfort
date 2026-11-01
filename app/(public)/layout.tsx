import { Suspense } from "react";
import { PublicHeader } from "../ui/public-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Suspense fallback={null}>
        <PublicHeader />
        {children}
      </Suspense>
    </div>
  );
}
