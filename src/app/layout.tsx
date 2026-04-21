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
    default: 'MNIT Marketplace | Secure Campus Buy & Sell Platform',
  },
  description: 'MNIT Marketplace — the official campus buying and selling platform for MNIT Jaipur students. Buy, sell, resell, and trade items safely within the MNIT community. Verified students only.',
  keywords: [
    // Platform name variants
    'MNIT Marketplace',
    'MNIT Resell',
    'MNIT Reseller',
    'MNIT Selling Platform',
    'MNIT Buy Sell',
    'MNIT Trade',
    'MNIT Campus Store',
    'MNIT Campus Market',
    'MNIT Second Hand',
    'MNIT Secondhand',
    'MNIT Used Items',
    'MNIT Pre-owned',
    'MNIT Student Marketplace',
    'MNIT Student Store',
    'MNIT Online Market',
    // College specific
    'MNIT Jaipur',
    'MNIT Jaipur Marketplace',
    'MNIT Jaipur Buy Sell',
    'MNIT Jaipur Student Platform',
    'Malaviya National Institute of Technology',
    'Malaviya National Institute of Technology Jaipur',
    'MNIT Jaipur Resell',
    'NIT Jaipur Marketplace',
    'NIT Jaipur Buy Sell',
    // Action keywords
    'Buy Used Items MNIT',
    'Sell Old Items MNIT',
    'Resell Items MNIT',
    'Buy Sell Trade Campus',
    'Campus Second Hand Market',
    'Student Buy Sell App',
    'College Marketplace India',
    'Campus Reselling Platform',
    // Product categories
    'Buy Used Books MNIT',
    'Sell Old Textbooks MNIT',
    'Used Electronics MNIT',
    'Second Hand Laptop MNIT',
    'Used Cycle Bicycle MNIT',
    'Used Furniture Hostel MNIT',
    'Old Notes MNIT',
    'Used Lab Equipment MNIT',
    // Trust & safety
    'Verified Campus Marketplace',
    'Safe Campus Buying',
    'Secure Student Marketplace',
    'MNIT Verified Sellers',
    'Anti Scam Marketplace',
    // Generic long-tail
    'MNIT Jaipur Online Shopping',
    'MNIT Hostel Buy Sell',
    'MNIT Campus Deals',
    'MNIT Student Deals',
    'MNIT Cheap Items',
    'Buy Cheap Items MNIT',
    'Sell Items Campus India',
    'Campus Classifieds MNIT',
    'MNIT Classifieds',
    'MNIT Peer to Peer',
    'mnitmarketplace',
    'mnitresell',
    'mnit market',
  ],
  authors: [{ name: 'MNIT Students' }],
  creator: 'MNIT Marketplace Team',
  publisher: 'MNIT Marketplace — Independent Student Platform',
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
import Footer from "@/components/Footer";
import MainLayout from "@/components/MainLayout";
import { createAdminClient } from "@/lib/supabase/admin";

// Cache admin settings for 60 seconds — eliminates a DB roundtrip on every page load
const getCachedAdminSettings = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('admin_settings')
      .select('is_buying_disabled')
      .single();
    return data;
  },
  ['admin-settings-layout'],
  { revalidate: 3600 } // 1 hour — admin_settings rarely changes; revalidatePath busts this on toggle
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedAdminSettings();
  const isBuyingDisabled = settings?.is_buying_disabled || false;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
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
        {children}
      </MainLayout>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-YOUR_TRACKING_ID"} />
    </html>
  );
}

