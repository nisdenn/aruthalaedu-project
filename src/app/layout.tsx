import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-screen bg-background text-gray-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
