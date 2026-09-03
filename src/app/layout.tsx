import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second Brain - Personal Link & Post Library",
  description: "Save YouTube videos and Twitter/X posts in organized folders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
