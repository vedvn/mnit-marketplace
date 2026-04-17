import { getProductById } from '@/lib/market-actions';
import { notFound } from 'next/navigation';
import { Tag, MapPin, Clock, IndianRupee, ShieldCheck } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isOwner = user?.id === product.seller_id;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-0 sm:pb-12 px-0 sm:px-6 max-w-6xl mx-auto">
      <Link href="/market" className="text-sm font-bold text-foreground/50 hover:text-primary-600 mb-6 sm:mb-8 mx-6 sm:mx-0 inline-block uppercase tracking-widest transition-colors">
        &larr; Back to Market
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 sm:bento-border border-y border-black/5 sm:border-y-0">
        {/* Images Column */}
        <div className="flex flex-col bento-border-b md:bento-border-b-0 md:bento-border-r">
          <div className="aspect-square w-full relative bg-foreground/5 bento-border-b">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30">
                <Tag className="w-16 h-16 mb-4" />
                <span className="mono-subtitle">No primary image</span>
              </div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-white text-foreground text-xs font-bold uppercase tracking-widest bento-border">
              {product.condition.replace('_', ' ')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-0">
            {product.images?.slice(1, 3).map((img: string, i: number) => (
              <div key={i} className={`aspect-square bg-foreground/5 ${i === 0 ? 'bento-border-r' : ''}`}>
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col bg-white">
          <div className="p-6 sm:p-8 md:p-12 bento-border-b">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl display-title uppercase mb-4 sm:mb-6 leading-none wrap-break-word hyphens-auto">{product.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2">
              <div className="flex items-start gap-1 sm:gap-2 text-primary-600 truncate">
                <IndianRupee className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mt-0.5 sm:mt-1 shrink-0" />
                <span className="text-4xl sm:text-5xl md:text-6xl font-black truncate">{product.price}</span>
              </div>
              
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center gap-3 pb-1 sm:pb-2">
                  <span className="text-xl sm:text-2xl text-foreground/40 font-bold line-through decoration-foreground/30 truncate">
                    ₹{product.original_price}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-black text-xs sm:text-sm uppercase tracking-widest rounded-md border border-emerald-500/20">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 bento-border-b">
             <div className="p-3 sm:p-6 flex flex-col items-center justify-center text-center bento-border-r">
               <Tag className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-foreground/50" />
               <span className="mono-subtitle mb-1 hidden sm:block">Category</span>
               <span className="font-bold text-foreground text-[10px] sm:text-sm uppercase tracking-wide line-clamp-1">{product.category?.name || 'General'}</span>
             </div>
             <div className="p-3 sm:p-6 flex flex-col items-center justify-center text-center bento-border-r">
               <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-foreground/50" />
               <span className="mono-subtitle mb-1 hidden sm:block">Pickup at</span>
               <span className="font-bold text-foreground text-[10px] sm:text-sm uppercase tracking-wide line-clamp-1">{product.pickup_address}</span>
             </div>
             <div className="p-3 sm:p-6 flex flex-col items-center justify-center text-center">
               <Clock className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-foreground/50" />
               <span className="mono-subtitle mb-1 hidden sm:block">Listed on</span>
               <span className="font-bold text-foreground text-[10px] sm:text-sm uppercase tracking-wide whitespace-nowrap">
                 {new Date(product.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
               </span>
             </div>
          </div>

          <div className="p-8 md:p-12 flex-1">
            <h3 className="mono-subtitle mb-4">Description</h3>
            <p className="text-foreground/80 leading-relaxed font-sans whitespace-pre-line text-lg font-light">
              {product.description}
            </p>
          </div>

          {/* Seller & Action */}
          <div className="mt-auto border-t border-black/5 bg-foreground/5">
            {/* Seller — always anonymous until purchase */}
            <div className="px-8 py-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-foreground/10 flex items-center justify-center rounded-sm">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight uppercase tracking-wide">Verified MNIT Student</p>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 mt-0.5">
                  Seller identity revealed after purchase
                </p>
              </div>
            </div>

            <div className="w-full">
              {isOwner ? (
                <button disabled className="w-full py-6 bg-white text-foreground/50 font-bold uppercase tracking-widest text-sm bento-border-t cursor-not-allowed">
                  This is your listing
                </button>
              ) : (
                <CheckoutButton
                  productId={product.id}
                  price={product.price}
                  isLoggedIn={!!user}
                  productTitle={product.title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

