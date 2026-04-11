import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Media Remote Control",
  description: "Control your media with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable)} >
      <body className="min-h-svh w-full min-w-xs md:max-w-sm mx-auto flex flex-col bg-zinc-950 font-sans "><AuthWrapper>{children}</AuthWrapper></body>
    </html>
  );
}
