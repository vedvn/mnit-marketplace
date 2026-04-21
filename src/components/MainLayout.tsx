'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Lazy-load: purely decorative, must never block SSR or initial hydration
const InteractiveBackground = dynamic(() => import('@/components/InteractiveBackground'), {
  ssr: false,
  loading: () => null,
});

interface MainLayoutProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  isBuyingDisabled?: boolean;
}

export default function MainLayout({ children, navbar, footer, isBuyingDisabled }: MainLayoutProps) {
  const pathname = usePathname();
  const isFullScreenPage = pathname === '/maintenance' || pathname === '/holiday';

  if (isFullScreenPage) {
    return (
      <body className="min-h-screen flex flex-col bg-background antialiased overflow-x-hidden">
        <main className="min-h-screen flex flex-col relative z-10">
          {children}
        </main>
      </body>
    );
  }

  return (
    <body className={`min-h-full flex flex-col font-sans bg-background text-foreground transition-all duration-300 ${isBuyingDisabled ? 'pt-[106px]' : 'pt-20'}`}>
      {isBuyingDisabled && (
        <div className="fixed top-0 left-0 right-0 h-12 bg-primary-600 text-white flex items-center justify-center gap-3 z-60 px-4 overflow-hidden border-b border-black/10">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
          <p className="text-[12px] font-black uppercase tracking-widest truncate">
            Purchases are temporarily paused for maintenance • Browsing and listing are active
          </p>
        </div>
      )}
      <InteractiveBackground />
      {navbar}
      {children}
      {footer}
    </body>
  );
}
