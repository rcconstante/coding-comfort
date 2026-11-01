import { connection } from "next/server";
import { PublicHeader } from "../ui/public-header";
import { PublicFooter } from "../ui/public-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <div className="site">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
