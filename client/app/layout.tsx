import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthWrapper from "@/components/AuthWrapper";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
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
    <html lang="en" className={cn("h-full", "antialiased", dmSans.variable)} >
      <body className="min-h-svh w-full min-w-xs md:max-w-sm mx-auto flex flex-col bg-zinc-950 font-sans relative">
        <AuthWrapper>
          {children}
          <Navigation className="absolute bottom-4 left-1/2 -translate-x-1/2" />
        </AuthWrapper>
      </body>
    </html>
  );
}
