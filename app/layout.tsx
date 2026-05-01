import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
import InstallAppPrompt from "../components/InstallAppPrompt";
import Nav from "@/components/Nav";
import AnalyticsTracker from "../components/AnalyticsTracker";
import { Suspense } from "react";

function ToasterWrapper() {
  return <Toaster richColors position="top-right" visibleToasts={1} />;
}

function AnalyticsTrackerWrapper() {
  return <AnalyticsTracker />;
}

export const metadata: Metadata = {
  title: "Agentwithme",
  description: "this app helps youget affordable property easily",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/main.png" type="image/png" />
      </head>
      <body>
        {children}
        <InstallAppPrompt />
        <Analytics />
        <Suspense fallback={null}>
          <AnalyticsTrackerWrapper />
        </Suspense>
        <Suspense fallback={null}>
          <ToasterWrapper />
        </Suspense>
        <Nav />
      </body>
    </html>
  );
}
