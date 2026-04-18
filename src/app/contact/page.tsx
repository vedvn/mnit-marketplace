import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Contact Us | MNIT Marketplace",
  description: "Get in touch with the MNIT Marketplace administration team for support, dispute resolution, or privacy queries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-16 bento-border-b">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-primary-600 transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-primary-600 rounded-full" />
              <span className="mono-subtitle">Contact Transparency</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl display-title uppercase leading-none">
              Get in<br />
              <span className="text-primary-600">Touch.</span>
            </h1>
          </div>
          <div className="md:pb-2 max-w-sm">
            <p className="text-foreground/70 font-sans leading-relaxed">
              Have a question about a transaction or need help with your account? Our student administration team is here to assist the MNIT community.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Email */}
        <div className="glass-card p-10 bento-border flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl display-title uppercase mb-4">Official Email</h2>
          <p className="text-sm text-foreground/60 mb-6">For disputes, account issues, and formal requests.</p>
          <a href="mailto:mnitmarketplace@gmail.com" className="text-lg font-black tracking-tight text-primary-600 hover:text-primary-900 transition-colors">
            mnitmarketplace@gmail.com
          </a>
        </div>

        {/* Phone */}
        <div className="glass-card p-10 bento-border flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <Phone className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl display-title uppercase mb-4">Support Phone</h2>
          <p className="text-sm text-foreground/60 mb-6">Mandatory merchant support line for transaction assistance.</p>
          <a href="tel:+917760677104" className="text-lg font-black tracking-tight text-emerald-600 hover:text-emerald-900 transition-colors">
            +91 7760677104
          </a>
        </div>

        {/* Address */}
        <div className="glass-card p-10 bento-border flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-zinc-900" />
          </div>
          <h2 className="text-xl display-title uppercase mb-4">Support Address</h2>
          <p className="text-sm text-foreground/60 mb-6">Independent Administration Team</p>
          <span className="text-sm font-bold text-zinc-900 leading-relaxed">
            MNIT Campus, J.L.N. Marg,<br />Jaipur, Rajasthan 302017
          </span>
        </div>
      </section>

      {/* Compliance Disclosures */}
      <section className="w-full bg-zinc-50 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16">
            <h2 className="text-3xl display-title uppercase mb-4">Merchant Disclosures</h2>
            <p className="text-foreground/50 max-w-2xl font-sans leading-relaxed">
              To comply with Indian e-commerce regulations and Payment Gateway guidelines, the following operational policies apply to all transactions facilitated through our independent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Refund & Cancellation Timeline</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Once a refund is approved by our administration team (due to non-handover or verified disputes), the funds will be processed through the original payment method. Please allow **5 to 7 business days** for the amount to reflect in your account, as per standard banking procedures.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <ShieldCheck className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Strict Disciplinary Action</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Fraud, non-delivery, and scammers face **STRICT, IMMEDIATE, and IRREVERSIBLE action**. The Platform Administration maintains an absolute zero-tolerance policy; confirmed violators will be PERMANENTLY banned and blocked from all future participation without appeal.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Shipping & Delivery Policy</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    As this is a **Campus-Only Self-Pickup** marketplace, MNIT Marketplace does not handle physical logistics or third-party shipping. Items are delivered via a physical meetup between the buyer and seller at the mutually agreed upon campus location.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-white bento-border">
                <p className="text-xs text-foreground/50 italic leading-relaxed">
                  Support Operating Hours: Mon - Fri (10:00 AM - 5:00 PM IST). We aim to respond to all institutional queries within 48 to 72 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer link to support */}
      <section className="w-full bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl display-title uppercase mb-3 text-center md:text-left">Ready to get back to the market?</h2>
          </div>
          <Link
            href="/market"
            className="w-full md:w-auto text-center px-12 py-5 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
          >
            Browse Listings
          </Link>
        </div>
      </section>
    </main>
  );
}
