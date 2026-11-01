import { connection } from "next/server";
import { PublicHeader } from "../ui/public-header";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <div className="site">
      <PublicHeader />
      {children}
    </div>
  );
}
