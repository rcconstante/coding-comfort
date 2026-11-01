import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ui/convex-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coding Comfort",
  icons: {
    icon: { url: "/favicon.webp", type: "image/webp" },
    apple: "/apple-touch-icon.png",
  },
  description:
    "A gentle space to check in with yourself and take a moment for your emotional well-being. Available in English and Filipino.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
