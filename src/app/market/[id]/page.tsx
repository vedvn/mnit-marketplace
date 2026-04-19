import { getProductById, recordProductInteraction } from '@/lib/market-actions';
import { notFound } from 'next/navigation';
import { Tag, MapPin, Clock, IndianRupee, ShieldCheck } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CAMPUS_SAFE_ZONES } from '@/lib/constants/locations';
import ProductCarousel from './ProductCarousel';
import { createAdminClient } from '@/lib/supabase/admin';
import { Metadata, ResolvingMetadata } from 'next';
import DeliveryWindowBanner from '@/components/DeliveryWindowBanner';
import ShareButton from '@/components/ShareButton';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const locationName = CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address.replace('_', ' ');
  const description = `${product.title} - ₹${product.price} | ${product.condition.replace('_', ' ')} condition. Available for pickup at ${locationName} on MNIT campus.`;

  return {
    title: product.title,
    description: description,
    openGraph: {
      title: `${product.title} | MNIT Marketplace`,
      description: description,
      images: product.images?.[0] ? [product.images[0]] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  // Orchestrate high-fidelity interaction audit (non-owner only)
  await recordProductInteraction(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminSupabase = createAdminClient();
  const { data: adminSettings } = await adminSupabase.from('admin_settings').select('*').single();
  const feePercent: number = adminSettings?.platform_fee_percent ?? 5;
  const isBuyingDisabled: boolean = adminSettings?.is_buying_disabled ?? false;

  const isOwner = user?.id === product.seller_id;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-0 sm:pb-12 px-0 sm:px-6 max-w-6xl mx-auto">
      <Link href="/market" className="text-sm font-bold text-foreground/50 hover:text-primary-600 mb-6 sm:mb-8 mx-6 sm:mx-0 inline-block uppercase tracking-widest transition-colors">
        &larr; Back to Market
      </Link>

      <DeliveryWindowBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 sm:bento-border border-y border-black/5 sm:border-y-0">
        {/* Images Column — Now Sticky on Desktop */}
        <div className="md:sticky md:top-24 h-fit">
          <ProductCarousel 
            images={product.images || []} 
            title={product.title} 
            condition={product.condition} 
          />
        </div>

        {/* Info Column */}
        <div className="flex flex-col bg-white">
          <div className="p-8 md:p-12 bento-border-b">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl display-title uppercase leading-none wrap-break-word hyphens-auto pr-4">{product.title}</h1>
                <div className="shrink-0 -mt-1">
                  <ShareButton 
                    title={product.title}
                    text={`Check out this ${product.title} for ₹${product.price} on MNIT Marketplace!`}
                    url={`/market/${product.id}`}
                  />
                </div>
              </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2">
              <div className="flex items-start gap-1 sm:gap-2 text-primary-600 truncate">
                <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 mt-0.5 sm:mt-1 shrink-0" />
                <span className="text-3xl sm:text-4xl md:text-5xl font-black truncate">{product.price}</span>
              </div>
              
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center gap-3 pb-1 sm:pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Original MRP</span>
                    <span className="text-lg sm:text-xl text-foreground/40 font-bold line-through decoration-foreground/30 truncate">
                      ₹{product.original_price}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-1">Save ₹{Math.round(product.original_price - product.price)}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-md border border-emerald-500/20">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </span>
                  </div>
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
               <span className="font-bold text-foreground text-[10px] sm:text-sm uppercase tracking-wide line-clamp-1">
                 {CAMPUS_SAFE_ZONES.find(z => z.id === product.pickup_address.toLowerCase())?.name || product.pickup_address.replace('_', ' ')}
               </span>
             </div>
             <div className="p-3 sm:p-6 flex flex-col items-center justify-center text-center">
               <Clock className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-foreground/50" />
               <span className="mono-subtitle mb-1 hidden sm:block">Listed on</span>
               <span className="font-bold text-foreground text-[10px] sm:text-sm uppercase tracking-wide whitespace-nowrap">
                 {new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
                  isBuyingDisabled={isBuyingDisabled}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

