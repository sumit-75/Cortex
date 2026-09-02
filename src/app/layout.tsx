import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second Brain - Personal Link & Post Library",
  description: "Save YouTube videos, Twitter posts, and Instagram media in organized folders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
