'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, IndianRupee, Tag, Clock, ShieldCheck, Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import ProductQuickView from '@/components/ProductQuickView';

// Lazy-load below-fold interactive components — not needed for LCP or initial paint
const CheckoutButton = dynamic(() => import('./[id]/CheckoutButton'), { ssr: false, loading: () => null });
const ShareButton = dynamic(() => import('@/components/ShareButton'), { ssr: false, loading: () => null });

import { logAnalyticsEvent } from '@/lib/analytics-actions';

export default function MarketGrid({ initialProducts, categories, isLoggedIn, currentUserId }: { initialProducts: any[], categories: any[], isLoggedIn: boolean, currentUserId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleProductClick = (productId: string, categoryId: string) => {
    // Strict compliance check
    if (typeof window !== 'undefined' && localStorage.getItem('mnit_cookie_consent')) {
      logAnalyticsEvent('PRODUCT_INTERACTION', `/market/${productId}`, productId, categoryId, { action: 'GRID_CLICK' });
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/).filter(t => t.length > 1);

    return initialProducts
      .map(product => {
        let score = 0;
        if (query) {
          const title = product.title.toLowerCase();
          const desc = (product.description || '').toLowerCase();
          
          if (title.includes(query)) score += 20;
          else if (desc.includes(query)) score += 10;
          
          terms.forEach(term => {
            if (title.includes(term)) score += 3;
            else if (desc.includes(term)) score += 1;
          });
        }
        return { product, score };
      })
      .filter(({ product, score }) => {
        const matchesCategory = categoryFilter ? product.category_id === categoryFilter : true;
        const matchesCondition = conditionFilter ? product.condition === conditionFilter : true;
        const matchesSearch = query ? score > 0 : true;
        return matchesSearch && matchesCategory && matchesCondition;
      })
      .sort((a, b) => {
        if (query && a.score !== b.score) {
          return b.score - a.score; // prioritize relevance when searching
        }
        if (sortBy === 'price_asc') return a.product.price - b.product.price;
        if (sortBy === 'price_desc') return b.product.price - a.product.price;
        if (sortBy === 'oldest') return new Date(a.product.created_at).getTime() - new Date(b.product.created_at).getTime();
        // default: newest
        return new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime();
      })
      .map(({ product }) => product);
  }, [initialProducts, searchQuery, categoryFilter, conditionFilter, sortBy]);

  return (
    <div className="w-full">
      {/* Filters & Search Bar */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white bento-border shadow-sm focus:border-primary-600 outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bento-border shadow-sm focus:border-primary-600 outline-none appearance-none text-sm font-bold uppercase tracking-wide text-foreground/80"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bento-border shadow-sm focus:border-primary-600 outline-none appearance-none text-sm font-bold uppercase tracking-wide text-foreground/80"
            >
              <option value="">Any Condition</option>
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>

          <div className="relative flex-1">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bento-border shadow-sm focus:border-primary-600 outline-none appearance-none text-sm font-bold uppercase tracking-wide text-foreground/80"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white bento-border w-full">
          <Search className="w-12 h-12 text-foreground/20 mb-4" />
          <h3 className="text-xl display-title uppercase mb-2">No Matches Found</h3>
          <p className="mono-subtitle">
            Try adjusting your search or filters to see more listings.
          </p>
          {(searchQuery || categoryFilter || conditionFilter) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setConditionFilter('');
                setSortBy('newest');
              }}
              className="mt-6 px-6 py-2 bg-foreground/5 bento-border text-xs font-bold uppercase tracking-widest hover:bg-foreground/10 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 bento-border-t bento-border-l">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/market/${product.id}`}
              onClick={() => handleProductClick(product.id, product.category_id)}
              className="group flex flex-col bg-white overflow-hidden bento-border-r bento-border-b hover:bg-foreground/5 transition-colors"
            >
              {/* Image Container */}
              <div className="aspect-4/3 w-full bg-foreground/5 relative overflow-hidden bento-border-b">
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-105"
                    loading="lazy"
                    quality={75}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-8 h-8 text-foreground/20" />
                  </div>
                )}
                
                <ProductQuickView product={product} isLoggedIn={isLoggedIn} />

                <div className="absolute top-3 left-3 px-3 py-1 bg-white text-foreground text-[10px] font-bold uppercase tracking-wider bento-border shadow-sm">
                  {product.condition.replace('_', ' ')}
                </div>

                {/* Delivery Window Overlay Removed (Market remains visible 24/7) */}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-col gap-1 mb-3">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 display-title group-hover:text-primary-600 transition-colors">{product.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center text-primary-600 font-black text-xl">
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      <span>{product.price}</span>
                    </div>
                    {product.original_price && product.original_price > product.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground/30 line-through decoration-foreground/20 font-bold">
                          ₹{product.original_price}
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 font-black text-[9px] uppercase tracking-widest rounded-md border border-emerald-500/20">
                          {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-6 min-w-0">
                  <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-foreground/50 truncate">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span className="truncate">
                      {CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="shrink-0 -mr-2">
                    <ShareButton 
                      title={product.title}
                      text={`Check out this ${product.title} for ₹${product.price} on MNIT Marketplace!`}
                      url={`/market/${product.id}`}
                    />
                  </div>
                </div>

              <div className="mt-auto pt-4 border-t border-black/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified MNIT Student
                  </div>
                  <div className="flex items-center mono-subtitle text-foreground/40 text-[9px]">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(product.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Direct Buy Action */}
                <div onClick={(e) => e.preventDefault()} className="w-full">
                  {product.status === 'AVAILABLE' && (
                    product.seller_id === currentUserId ? (
                      <div className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-center bg-foreground/5 rounded-lg border border-black/5">
                        Your Listing
                      </div>
                    ) : (
                      <CheckoutButton 
                        productId={product.id}
                        price={product.price}
                        isLoggedIn={isLoggedIn} 
                        productTitle={product.title}
                        variant="compact"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
