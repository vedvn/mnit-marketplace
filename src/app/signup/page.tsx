'use client';

import { useState } from 'react';
import { signUp, verifySignupOTP } from '@/lib/auth-actions';
import { ShieldCheck, Mail, KeyRound, User, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-400', 'bg-primary-600'][passwordStrength];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get('email') as string;
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setRegisteredEmail(emailStr);
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await verifySignupOTP(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex text-3xl display-title font-bold tracking-tight mb-4">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm mr-2">MNIT</span>
            <span className="text-foreground">MARKETPLACE</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 display-title uppercase">
            {registeredEmail ? 'Verify Your Email' : 'Create Account'}
          </h1>
          <p className="text-foreground/60 text-sm">
            {registeredEmail 
              ? <>Enter the 6-digit code sent to <span className="font-bold text-primary-600">{registeredEmail}</span></>
              : <>Register with your <span className="font-bold text-primary-600">@mnit.ac.in</span> email to join the campus marketplace.</>
            }
          </p>
        </div>

        {/* Verification State */}
        {registeredEmail ? (
          <div className="glass-card p-8 bento-border text-center">
            
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3 text-left">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <input type="hidden" name="email" value={registeredEmail} />
              
              <div className="space-y-2 text-left">
                <label htmlFor="token" className="mono-subtitle">6-Digit Verification Code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-xl tracking-widest text-center transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest mt-2">
                Check spam folder if not found within 2 minutes.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-8 bento-border">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="mono-subtitle">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="mono-subtitle">Student Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="yourname@mnit.ac.in"
                    className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="mono-subtitle">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-foreground/5 bento-border focus:border-primary-600 outline-none text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : 'bg-foreground/10'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-amber-500' : 'text-primary-600'
                    }`}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Terms note */}
              <p className="text-xs text-foreground/50 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" target="_blank" className="text-primary-600 font-bold hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and the MNIT Marketplace anti-scam policy.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-foreground/60 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary-600 hover:text-primary-900 transition-colors">
                Log In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
