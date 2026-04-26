import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthWrapper from "@/components/AuthWrapper";
import AppShell from "@/components/AppShell";
import Navigation from "@/components/Navigation";
import ThemeProvider from "@/components/ThemeProvider";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
export const metadata: Metadata = {
  title: "Media Remote Control",
  description: "Control your media with ease",
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", dmSans.variable)} suppressHydrationWarning>
      <body className="min-h-svh w-full min-w-xs md:max-w-sm mx-auto flex flex-col bg-zinc-950 font-sans relative pb-24">
        <ThemeProvider>
          <AppShell>
            <AuthWrapper>
              {children}
              <Navigation className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" />
            </AuthWrapper>
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
