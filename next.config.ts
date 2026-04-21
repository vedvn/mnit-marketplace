import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js <Image> to optimize images from Supabase Storage CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hzlrrtksiuxamsxgvpwo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Serve WebP/AVIF automatically — better compression than JPEG on mobile
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 1 week (60s * 60min * 24h * 7d)
    minimumCacheTTL: 604800,
  },
};

export default nextConfig;
