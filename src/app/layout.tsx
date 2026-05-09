import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { unstable_cache } from "next/cache";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional", // eliminates render-blocking FOUT
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "optional", // eliminates render-blocking FOUT
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mnitmarketplace.store'),
  title: {
    template: '%s | MNIT Marketplace',
    default: 'MNIT Marketplace | Campus Buy, Sell & Resell Platform — MNIT Jaipur',
  },
  description: 'MNIT Marketplace is the official second-hand & resell platform for MNIT Jaipur students. Buy, sell, resell and trade used books, electronics, cycles, furniture and more — safely within campus. Verified MNIT students only. Free to list.',
  keywords: [
    // ── Core brand name variants ─────────────────────────────────────────────
    'MNIT Marketplace',
    'MNIT Market',
    'MNIT Resell',
    'MNIT Reseller',
    'MNIT Reselling',
    'mnit resell',
    'mnit market',
    'mnitresell',
    'mnitmarket',
    'mnitmarketplace',
    'mnit marketplace',
    // ── Second-hand / used goods variants ────────────────────────────────────
    'MNIT Second Hand Market',
    'MNIT Second Hand',
    'MNIT Secondhand Market',
    'MNIT Secondhand',
    'MNIT Second Hand Items',
    'MNIT Used Items',
    'MNIT Used Goods',
    'MNIT Pre-owned',
    'MNIT Pre Owned Items',
    'MNIT Old Items',
    'second hand market MNIT',
    'used items MNIT Jaipur',
    // ── Platform type keywords ────────────────────────────────────────────────
    'MNIT Selling Platform',
    'MNIT Buy Sell',
    'MNIT Buy and Sell',
    'MNIT Trade',
    'MNIT Campus Store',
    'MNIT Campus Market',
    'MNIT Campus Marketplace',
    'MNIT Student Marketplace',
    'MNIT Student Market',
    'MNIT Student Store',
    'MNIT Online Market',
    'MNIT Online Store',
    'MNIT Classifieds',
    'MNIT Campus Classifieds',
    'MNIT Peer to Peer',
    'MNIT P2P Market',
    // ── College & location specific ───────────────────────────────────────────
    'MNIT Jaipur',
    'MNIT Jaipur Marketplace',
    'MNIT Jaipur Market',
    'MNIT Jaipur Buy Sell',
    'MNIT Jaipur Resell',
    'MNIT Jaipur Second Hand',
    'MNIT Jaipur Second Hand Market',
    'MNIT Jaipur Used Items',
    'MNIT Jaipur Student Platform',
    'MNIT Jaipur Online Shopping',
    'MNIT Jaipur Hostel Market',
    'Malaviya National Institute of Technology',
    'Malaviya National Institute of Technology Jaipur',
    'Malaviya NIT Jaipur Market',
    'NIT Jaipur Marketplace',
    'NIT Jaipur Buy Sell',
    'NIT Jaipur Second Hand',
    'NIT Jaipur Resell',
    // ── Action / intent keywords ──────────────────────────────────────────────
    'Buy Used Items MNIT',
    'Sell Old Items MNIT',
    'Resell Items MNIT',
    'buy second hand MNIT',
    'sell second hand MNIT',
    'Buy Sell Trade Campus',
    'Campus Second Hand Market',
    'Student Buy Sell App',
    'College Marketplace India',
    'Campus Reselling Platform',
    'where to buy used items MNIT',
    'where to sell books MNIT',
    // ── Product category keywords ─────────────────────────────────────────────
    'Buy Used Books MNIT',
    'Sell Old Textbooks MNIT',
    'Used Textbooks MNIT Jaipur',
    'Second Hand Books MNIT',
    'Used Electronics MNIT',
    'Second Hand Laptop MNIT',
    'Used Laptop MNIT Jaipur',
    'Used Cycle MNIT',
    'Second Hand Cycle MNIT',
    'Used Bicycle MNIT Jaipur',
    'Used Furniture Hostel MNIT',
    'Hostel Furniture MNIT',
    'Old Notes MNIT',
    'MNIT Study Notes',
    'Used Lab Equipment MNIT',
    'Used Mobile MNIT',
    'Second Hand Phone MNIT',
    // ── Trust & safety signals ────────────────────────────────────────────────
    'Verified Campus Marketplace',
    'Safe Campus Buying',
    'Secure Student Marketplace',
    'MNIT Verified Sellers',
    'Anti Scam Marketplace',
    'Safe Second Hand Market India',
    // ── Hostel & campus life ──────────────────────────────────────────────────
    'MNIT Hostel Buy Sell',
    'MNIT Hostel Market',
    'MNIT Campus Deals',
    'MNIT Student Deals',
    'MNIT Cheap Items',
    'Buy Cheap Items MNIT',
    'Sell Items Campus India',
    'MNIT Campus Life',
    // ── Common typos & misspellings (Bing catches these well) ────────────────
    'MNIT Resell Platform',
    'MNIT Resel',
    'mnit resller',
    'mnit markt',
    'mnitjaipur marketplace',
    'mnit jaipr marketplace',
  ],
  authors: [{ name: 'MNIT Marketplace Team', url: 'https://mnitmarketplace.store' }],
  creator: 'MNIT Marketplace Team',
  publisher: 'MNIT Marketplace — Independent Student Platform',
  alternates: {
    canonical: 'https://mnitmarketplace.store',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mnitmarketplace.store',
    siteName: 'MNIT Marketplace',
    title: 'MNIT Marketplace | Buy & Sell Second Hand Items — MNIT Jaipur Campus',
    description: 'The only verified second-hand marketplace built exclusively for MNIT Jaipur students. Buy books, cycles, electronics and more — or sell what you no longer need. Safe, fast, campus-only.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MNIT Marketplace — Campus Buy & Sell Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MNIT Marketplace | Campus Buy, Sell & Resell',
    description: 'Buy & sell second hand items within MNIT Jaipur campus — verified students only. Books, cycles, electronics, furniture and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import NavBar from "@/components/NavBar";
import InteractiveBackground from "@/components/InteractiveBackground";
import Footer from "@/components/Footer";
import MainLayout from "@/components/MainLayout";
import { createAdminClient } from "@/lib/supabase/admin";

import { getAdminSettingsCached } from '@/lib/settings';

import { Suspense } from "react";
import UmamiTracker from "@/components/UmamiTracker";
import CookieConsent from "@/components/CookieConsent";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getAdminSettingsCached();
  const isBuyingDisabled = settings?.is_buying_disabled || false;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Supabase to eliminate TCP+TLS handshake latency on first DB query */}
        <link rel="preconnect" href="https://hzlrrtksiuxamsxgvpwo.supabase.co" />
        <link rel="dns-prefetch" href="https://hzlrrtksiuxamsxgvpwo.supabase.co" />
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <MainLayout 
        navbar={<NavBar isBuyingDisabled={isBuyingDisabled} />} 
        footer={<Footer />}
        isBuyingDisabled={isBuyingDisabled}
      >
        <Suspense fallback={null}>
          <UmamiTracker />
          <CookieConsent />
        </Suspense>
        {children}
      </MainLayout>
    </html>
  );
}

