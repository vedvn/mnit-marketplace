import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/employee',
        '/complete-profile',
        '/orders',
        '/banned',
        '/profile',
        '/forgot-password',
        '/reset-password',
        '/api',
        '/_next',
      ],
    },
    sitemap: 'https://mnit-marketplace.com/sitemap.xml',
  };
}
