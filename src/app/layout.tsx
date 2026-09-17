import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGM Payment Operations - MGM Financiers Pvt Limited",
  description:
    "Maker-checker payment operations, AI optical verification, and DSA channel partner commission automation engine for MGM Financiers Pvt Limited.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "MGM Payment Operations - MGM Financiers Pvt Limited",
    description:
      "Maker-checker payment operations, AI optical verification, and DSA channel partner commission automation engine for MGM Financiers Pvt Limited.",
  },
  appleWebApp: {
    capable: true,
    title: "MGM PayOps",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-slate-950 text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
