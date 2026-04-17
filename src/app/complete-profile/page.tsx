'use client';

import { useState } from 'react';
import { completeProfile } from '@/lib/profile-complete-action';
import { Phone, Landmark, Hash, Loader2, ArrowRight, ShieldCheck, CheckCircle2, Building2, Smartphone } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Contact', 'Banking', 'Confirm'];

export default function CompleteProfilePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('upi');
  const [formData, setFormData] = useState({
    phone_number: '',
    bank_account_number: '',
    bank_ifsc: '',
    upi_id: '',
  });

  function update(key: string, val: string) {
    setFormData(prev => ({ ...prev, [key]: val }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    fd.append('payout_method', payoutMethod);
    const result = await completeProfile(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex text-3xl display-title font-bold tracking-tight mb-4">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm mr-2">MNIT</span>
            <span className="text-foreground">MARKETPLACE</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 display-title uppercase">Complete Your Profile</h1>
          <p className="text-foreground/60 text-sm max-w-xs mx-auto">
            We need a few details to activate your account for buying and selling.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-500 ${
                  i < step ? 'bg-primary-600 border-primary-600 text-white' :
                  i === step ? 'bg-white border-primary-600 text-primary-600 shadow-[0_0_0_4px_rgb(79,70,229,0.15)]' :
                  'bg-white border-black/10 text-foreground/30'
                }`}>
                  {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${i === step ? 'text-primary-600' : 'text-foreground/30'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-16 mx-1 mb-4 transition-all duration-500 ${i < step ? 'bg-primary-600' : 'bg-black/10'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card p-8 bento-border space-y-5">

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 0 — Contact */}
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="p-4 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl">
                  <p className="font-bold mb-1">Why do we need this?</p>
                  <p className="text-xs leading-relaxed">Your phone number lets sellers reach you to arrange item pickup after a successful purchase. It's never shown publicly.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="mono-subtitle">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-foreground/40" />
                      <span className="text-foreground/40 font-bold text-sm border-r border-black/10 pr-2">+91</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="98XXXXXXXX"
                      value={formData.phone_number}
                      onChange={e => update('phone_number', e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-24 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
                      setError('Enter a valid 10-digit Indian mobile number.');
                      return;
                    }
                    setError(null);
                    setStep(1);
                  }}
                  className="group flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors mt-2"
                >
                  Next — Add Banking Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* STEP 1 — Payout Method */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl">
                  <p className="font-bold mb-1">Payout Method</p>
                  <p className="text-xs leading-relaxed">Required to receive payouts when your items sell. Choose whichever is convenient — you can update this later in your profile.</p>
                </div>

                {/* Toggle */}
                <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setPayoutMethod('upi'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      payoutMethod === 'upi' ? 'bg-white shadow text-primary-600' : 'text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPayoutMethod('bank'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      payoutMethod === 'bank' ? 'bg-white shadow text-primary-600' : 'text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Bank A/C
                  </button>
                </div>

                {/* UPI Fields */}
                {payoutMethod === 'upi' && (
                  <div className="space-y-2">
                    <label htmlFor="upi" className="mono-subtitle">UPI ID</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        id="upi"
                        type="text"
                        placeholder="yourname@upi"
                        value={formData.upi_id}
                        onChange={e => update('upi_id', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm font-mono transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Fields */}
                {payoutMethod === 'bank' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="account" className="mono-subtitle">Account Number</label>
                      <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                          id="account"
                          type="text"
                          placeholder="Enter your bank account number"
                          value={formData.bank_account_number}
                          onChange={e => update('bank_account_number', e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="ifsc" className="mono-subtitle">IFSC Code</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                          id="ifsc"
                          type="text"
                          maxLength={11}
                          placeholder="e.g. SBIN0001234"
                          value={formData.bank_ifsc}
                          onChange={e => update('bank_ifsc', e.target.value.toUpperCase())}
                          className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm font-mono tracking-widest transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 bg-foreground/5 font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-colors">
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (payoutMethod === 'upi') {
                        if (!formData.upi_id || !formData.upi_id.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi).'); return; }
                      } else {
                        if (!formData.bank_account_number) { setError('Bank account number is required.'); return; }
                        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank_ifsc)) { setError('Enter a valid IFSC code (e.g. SBIN0001234).'); return; }
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="group flex-2 flex items-center justify-center gap-2 py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
                  >
                    Review & Confirm
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <p className="text-foreground/60 text-sm">Please review your details before saving.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Mobile', value: `+91 ${formData.phone_number}` },
                    { label: 'Payout via', value: payoutMethod === 'upi' ? 'UPI' : 'Bank Account' },
                    ...(payoutMethod === 'upi'
                      ? [{ label: 'UPI ID', value: formData.upi_id }]
                      : [
                          { label: 'Account No.', value: formData.bank_account_number },
                          { label: 'IFSC', value: formData.bank_ifsc },
                        ]
                    ),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 px-4 bg-foreground/5 bento-border">
                      <span className="mono-subtitle">{label}</span>
                      <span className="font-bold font-mono text-sm">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-foreground/5 font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-colors">
                    ← Edit
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex-2 flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <><CheckCircle2 className="w-4 h-4" /> Activate My Account</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </form>

        <p className="text-center text-xs text-foreground/40 mt-6 max-w-sm mx-auto">
          Your banking information is secured and only used for Razorpay payouts. We do not store card details.
        </p>
      </div>
    </div>
  );
}
