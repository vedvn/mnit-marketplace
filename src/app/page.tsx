import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck, Zap, Camera, CreditCard, Handshake, CheckCircle, Package, Laptop, BookOpen, Shirt, Music, Dumbbell, ChevronRight, Ban, Lock } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col w-full overflow-hidden">

      {/* ─── HERO ─── */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-48 flex flex-col items-start bento-border-b animate-fade-in-up">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
          <span className="mono-subtitle">Exclusive to MNIT Students</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-8xl display-title text-foreground max-w-5xl mb-8 uppercase wrap-break-word hyphens-auto">
          The Premier <br />
          Campus <span className="text-primary-600">Marketplace.</span>
        </h1>

        <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mb-12 font-sans font-light leading-relaxed">
          Buy, sell, and discover items exclusively within the MNIT community. Secure payments, zero haggling, and verified student profiles.
        </p>

        <div className="flex flex-col sm:flex-row gap-0 w-full sm:w-auto">
          <Link href="/market" className="group flex items-center justify-center gap-3 px-10 py-5 bg-primary-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-900 transition-colors">
            Explore Market
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/sell" className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-foreground font-bold text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors bento-border">
            List an Item
          </Link>
        </div>
      </section>

      {/* ─── STATS TICKER ─── */}
      <section className="w-full bento-border-b overflow-hidden bg-zinc-950">
        <div className="flex items-center divide-x divide-zinc-800 overflow-x-auto scrollbar-hide">
          {[
            { value: "100%", label: "MNIT Verified Users" },
            { value: "₹0", label: "Hidden Fees" },
            { value: "12h", label: "Escrow Release Time" },
            { value: "Live", label: "Photo Verification" },
            { value: "Razorpay", label: "Secure Payments" },
            { value: "Zero", label: "Tolerance for Fraud" },
          ].map(({ value, label }) => (
            <div key={label} className="shrink-0 px-10 py-6 text-center">
              <div className="text-xl sm:text-2xl font-black text-white display-title mb-1">{value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 bento-border-b">
        <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-foreground" />} title="Verified Only." description="Every user is strictly verified via @mnit.ac.in. No outsiders, complete trust." />
        <FeatureCard icon={<Zap className="w-8 h-8 text-foreground" />} title="Instant Checkout." description="No awkward bargaining. See an item, pay securely via Razorpay, arrange pickup." />
        <FeatureCard icon={<ShoppingBag className="w-8 h-8 text-foreground" />} title="Automated Escrow." description="Funds are held securely and released directly 12hrs after successful purchase." />
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 bento-border-b">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-primary-600 rounded-full" />
              <span className="mono-subtitle">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl display-title uppercase wrap-break-word">How It Works.</h2>
          </div>
          <Link href="/about" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/50 hover:text-primary-600 transition-colors">
            Full Guide <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 bento-border-t bento-border-l">
          {[
            { step: "01", icon: ShoppingBag, title: "Browse Market", desc: "Explore verified listings from real MNIT students. Every item is moderated before going live." },
            { step: "02", icon: CreditCard, title: "Pay Securely", desc: "Found what you need? Pay instantly via Razorpay. Your money is held in escrow — never sent to seller yet." },
            { step: "03", icon: Handshake, title: "Meet on Campus", desc: "Arrange a pickup at the seller's stated campus location. Inspect the item physically before accepting." },
            { step: "04", icon: CheckCircle, title: "Confirm & Done", desc: "Happy with the item? Hit 'Confirm Received' in your profile. Seller gets paid. You're protected throughout." },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="p-8 bento-border-r bento-border-b group hover:bg-foreground/5 transition-colors">
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl sm:text-5xl font-black text-foreground/10 display-title">{step}</span>
                <div className="w-10 h-10 flex items-center justify-center bg-primary-50 group-hover:bg-primary-600 transition-colors">
                  <Icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <h3 className="text-xl display-title uppercase mb-3">{title}</h3>
              <p className="text-foreground/60 text-sm font-sans leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORY GRID ─── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 bento-border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-primary-600 rounded-full" />
          <span className="mono-subtitle">Browse by Category</span>
        </div>
        <h2 className="text-4xl md:text-6xl display-title uppercase mb-16 wrap-break-word">What's on<br /> the Market.</h2>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-0 bento-border-t bento-border-l">
          {[
            { icon: Laptop, label: "Electronics", sub: "Laptops & Phones" },
            { icon: BookOpen, label: "Books", sub: "Textbooks & Notes" },
            { icon: Shirt, label: "Clothing", sub: "Shoes & Gear" },
            { icon: Music, label: "Music", sub: "Instruments & Audio" },
            { icon: Dumbbell, label: "Sports", sub: "Equipment & Kits" },
            { icon: Package, label: "Other", sub: "Furniture & Misc" },
          ].map(({ icon: Icon, label, sub }) => (
            <Link key={label} href="/market" className="group flex flex-col items-start p-6 sm:p-8 bento-border-r bento-border-b hover:bg-primary-600 transition-colors text-left">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-4 sm:mb-6 text-foreground/40 group-hover:text-white transition-colors" />
              <span className="font-bold uppercase tracking-wide text-xs sm:text-sm text-foreground group-hover:text-white transition-colors display-title">{label}</span>
              <span className="text-[10px] sm:text-xs text-foreground/50 group-hover:text-white/70 transition-colors mt-1 font-sans line-clamp-1">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── ANTI-SCAM PROMISE ─── */}
      <section className="w-full bento-border-b bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Text */}
            <div className="md:pr-16 md:border-r border-zinc-800 pb-12 md:pb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Our Commitment</span>
              </div>
              <h2 className="text-4xl md:text-6xl display-title uppercase mb-8 leading-none wrap-break-word">
                Zero<br />
                <span className="text-primary-500">Scams.</span><br />
                Period.
              </h2>
              <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed max-w-md">
                MNIT Marketplace is built from the ground-up with anti-fraud infrastructure. We don't just hope users are honest — we enforce it structurally.
              </p>
              <Link href="/terms" className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors group">
                Read Full Terms <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Feature List */}
            <div className="md:pl-16 pt-12 md:pt-0 space-y-8">
              {[
                { icon: Camera, title: "Mandatory Live Photos", desc: "Every seller must take a live camera photo of the item at listing time. No stock photos." },
                { icon: ShieldCheck, title: "Employee Moderation", desc: "Every listing is reviewed by a trained campus moderator against gallery images." },
                { icon: Lock, title: "Escrow Protection", desc: "Your money is never sent to the seller until you confirm the item physically." },
                { icon: Ban, title: "Permanent Bans", desc: "Proven fraudulent behavior results in an immediate, permanent ban." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 sm:gap-5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-zinc-700 shrink-0 mt-1">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 uppercase tracking-wide text-xs sm:text-sm">{title}</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-sans">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 sm:py-32 flex flex-col md:flex-row items-start md:items-end justify-between gap-10 bento-border-b">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-primary-600 rounded-full" />
            <span className="mono-subtitle">Ready to get started?</span>
          </div>
          <h2 className="text-4xl md:text-7xl display-title uppercase leading-none wrap-break-word">
            Your campus.<br />
            Your <span className="text-primary-600">market.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-0 w-full md:w-auto shrink-0">
          <Link href="/market" className="group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-primary-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-900 transition-colors">
            Browse Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/sell" className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-white text-foreground font-bold text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors bento-border">
            Start Selling
          </Link>
        </div>
      </section>

    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col p-8 sm:p-10 bento-border-t md:bento-border-t-0 md:bento-border-l first:border-l-0 bg-white hover:bg-foreground/5 transition-colors group">
      <div className="mb-12 sm:mb-16 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
      <h3 className="text-2xl sm:text-3xl display-title mb-3 sm:mb-4 uppercase wrap-break-word">{title}</h3>
      <p className="text-foreground/70 font-sans text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );
}
