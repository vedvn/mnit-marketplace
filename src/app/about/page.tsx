'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Tag, Camera, ShieldCheck, CheckCircle2, IndianRupee, MapPin, Handshake, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto relative">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[100px] mix-blend-multiply opacity-70" />
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] mix-blend-multiply opacity-50" />
      </div>

      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How It Works</h1>
        <p className="text-lg text-foreground/70 max-w-xl mx-auto">
          MNIT Marketplace is a secure, independent student-run marketplace. 
          Discover how our administration team protects the community via strict verification and enforcement.
        </p>
      </div>

      {/* Toggle switch */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1.5 rounded-full glass border border-black/10 bg-foreground/5 shadow-inner">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'buyer'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            I am a Buyer
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'seller'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            I am a Seller
          </button>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative">
        {/* Buyer View */}
        {activeTab === 'buyer' && (
          <div className="space-y-8 animate-fade-in-up">
            <StepCard 
              number={1}
              icon={<SearchIcon className="w-6 h-6 text-primary-500" />}
              title="Browse & Discover"
              color="primary"
              description="Explore verified listings from fellow MNIT students. All sellers must authenticate via their @mnit.ac.in emails before they can list items, eliminating outsiders."
            />
            <StepCard 
              number={2}
              icon={<ShieldCheck className="w-6 h-6 text-primary-500" />}
              title="Verified Payment Protection"
              color="primary"
              description="No awkward haggling or cash transactions. Pay instantly via Razorpay. Your funds are processed securely by the platform—we verify the transfer before the seller receives them."
            />
            <StepCard 
              number={3}
              icon={<MapPin className="w-6 h-6 text-primary-500" />}
              title="Meet on Campus"
              color="primary"
              description="Check the item's pickup location (e.g. Prabha Bhawan or specific hostels) and meet the seller to physically inspect and receive your item."
            />
            <StepCard 
              number={4}
              icon={<CheckCircle2 className="w-6 h-6 text-primary-500" />}
              title="Confirm Receipt"
              color="primary"
              description="Log into your Profile and click 'Confirm Received'. This final action officially completes the transaction. You're protected if the item is fake or never handed over!"
            />
            
            <div className="pt-8 text-center">
              <Link href="/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                Browse Market <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Seller View */}
        {activeTab === 'seller' && (
          <div className="space-y-8 animate-fade-in-up">
            <StepCard 
              number={1}
              icon={<Camera className="w-6 h-6 text-emerald-500" />}
              title="List & Live Verify"
              color="emerald"
              description="Fill out the item details and upload gallery photos. To prevent fake/drop-shipped items, you MUST capture a live camera photo of the item right from our app. This stays private."
            />
            <StepCard 
              number={2}
              icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
              title="Admin Moderation"
              color="emerald"
              description="Your item goes into PENDING_REVIEW. Our campus moderators will compare your gallery images against your live verification photo. Once verified, it is published to the market."
            />
            <StepCard 
              number={3}
              icon={<Handshake className="w-6 h-6 text-emerald-500" />}
              title="Handover the Item"
              color="emerald"
              description="Wait for a buyer to securely purchase the item via Razorpay. Once they've paid, arrange to hand the item over to them at your specified campus location."
            />
            <StepCard 
              number={4}
              icon={<IndianRupee className="w-6 h-6 text-emerald-500" />}
              title="Receive Your Earnings"
              color="emerald"
              description="Once the buyer clicks 'Confirm Received' on their dashboard, the transaction is finalized. The payout is then processed and routed to your bank account."
            />

            <div className="pt-8 text-center">
              <Link href="/profile" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                Go to Profile to Sell <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icons
function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function StepCard({ number, icon, title, description, color }: { number: number, icon: React.ReactNode, title: string, description: string, color: 'primary' | 'emerald' }) {
  const bgClass = color === 'primary' ? 'bg-primary-500/10' : 'bg-emerald-500/10';
  const textClass = color === 'primary' ? 'text-primary-500' : 'text-emerald-500';

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl glass-card border border-black/5 shadow-lg group hover:bg-foreground/5 transition-colors">
      <div className={`w-16 h-16 shrink-0 rounded-2xl ${bgClass} flex items-center justify-center relative`}>
        {icon}
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${textClass} bg-background border border-black/10 flex items-center justify-center text-xs font-black shadow-lg`}>
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/70 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
