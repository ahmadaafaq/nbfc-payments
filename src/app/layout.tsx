import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGM Payment Operations",
  description:
    "Maker-checker payment operations, AI optical verification, and DSA channel partner commission automation engine for MGM Financiers Pvt Limited.",
  openGraph: {
    title: "MGM Payment Operations",
    description:
      "Maker-checker payment operations, AI optical verification, and DSA channel partner commission automation engine for MGM Financiers Pvt Limited.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
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
