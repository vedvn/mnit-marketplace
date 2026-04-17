import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MNIT Marketplace | Exclusive Campus Marketplace",
  description: "The official, secure way for MNIT students to buy and sell items on campus. No haggling, secure payments, and strict privacy.",
};

import NavBar from "@/components/NavBar";
import { GoogleAnalytics } from '@next/third-parties/google';
import InteractiveBackground from "@/components/InteractiveBackground";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground pt-20">
        <InteractiveBackground />
        <CustomCursor />
        <NavBar />
        {children}
        <Footer />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-YOUR_TRACKING_ID"} />
    </html>
  );
}
