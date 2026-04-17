import { getProducts, getCategories } from '@/lib/market-actions';
import Link from 'next/link';
import MarketGrid from './MarketGrid';

export default async function MarketPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-6xl display-title uppercase mb-2">Market.</h1>
          <p className="mono-subtitle">Find great deals from verified MNIT students</p>
        </div>
        <Link 
          href="/sell" 
          className="px-8 py-3 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
        >
          Sell an Item
        </Link>
      </div>

      <MarketGrid initialProducts={products} categories={categories} />
    </div>
  );
}
