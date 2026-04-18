'use client';

import { useState } from 'react';
import { requestResetOTP, verifyRecoveryOTP } from '@/lib/auth-actions';
import { ShieldCheck, Mail, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [step, setStep]       = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [email, setEmail]     = useState('');
  const router = useRouter();

  async function handleRequestOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await requestResetOTP(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setEmail(formData.get('email') as string);
      setStep(2);
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('email', email);
    
    const res = await verifyRecoveryOTP(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Success - Supabase recovery session is now active
      router.push('/reset-password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm text-xl font-black tracking-tighter">MNIT</span>
            <span className="text-foreground text-xl font-black tracking-tighter">MARKETPLACE</span>
          </Link>
          <h1 className="text-2xl display-title uppercase mb-2">Reset Password</h1>
          <p className="text-foreground/60 text-sm">
            {step === 1 
              ? "Enter your email to receive a 6-digit recovery code." 
              : `We've sent a code to ${email}`}
          </p>
        </div>

        <div className="glass-card p-8 bento-border">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="mono-subtitle">Student Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="yourname@mnit.ac.in"
                    className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Recovery Code <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5 text-center">
              <div className="space-y-4">
                <label className="mono-subtitle block">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    name="token"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-4 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-center text-2xl font-black tracking-[0.5em] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-foreground/40 italic">Check your @mnit.ac.in inbox (and spam folder).</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                Entered wrong email? Go back
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-black/5 text-center">
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-primary-600 transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
