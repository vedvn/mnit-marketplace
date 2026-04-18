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
  metadataBase: new URL('https://mnit-marketplace.com'),
  title: {
    template: '%s | MNIT Marketplace',
    default: 'MNIT Marketplace | Secure Campus Marketplace',
  },
  description: 'The secure and independent campus marketplace for MNIT students. Buy, sell, and trade items safely within the community.',
  keywords: ['MNIT', 'Jaipur', 'Marketplace', 'Campus', 'Student', 'Buy', 'Sell', 'Used Items', 'MNIT Jaipur'],
  authors: [{ name: 'MNIT Students' }],
  creator: 'MNIT Marketplace Team',
  publisher: 'Independent Platform Administration',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mnit-marketplace.com',
    siteName: 'MNIT Marketplace',
    title: 'MNIT Marketplace | Exclusive Campus Marketplace',
    description: 'The secure and independent campus marketplace for MNIT students.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MNIT Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MNIT Marketplace',
    description: 'The secure campus marketplace for MNIT students.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import NavBar from "@/components/NavBar";
import { GoogleAnalytics } from '@next/third-parties/google';
import InteractiveBackground from "@/components/InteractiveBackground";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import MainLayout from "@/components/MainLayout";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminSupabase = createAdminClient();
  const { data: settings } = await adminSupabase.from('admin_settings').select('is_buying_disabled').single();
  const isBuyingDisabled = settings?.is_buying_disabled || false;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <MainLayout 
        navbar={<NavBar isBuyingDisabled={isBuyingDisabled} />} 
        footer={<Footer />}
        isBuyingDisabled={isBuyingDisabled}
      >
        {children}
      </MainLayout>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-YOUR_TRACKING_ID"} />
    </html>
  );
}
