'use client';

import { useState } from 'react';
import { signInWithPassword } from '@/lib/auth-actions';
import { ShieldCheck, Mail, KeyRound, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signInWithPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // on success, server action redirects — loading stays true intentionally
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm text-xl font-black tracking-tighter">MNIT</span>
            <span className="text-foreground text-xl font-black tracking-tighter">MARKETPLACE</span>
          </Link>
          <h1 className="text-2xl display-title uppercase mb-2">Student Login</h1>
          <p className="text-foreground/60 text-sm">
            Sign in with your <span className="font-bold text-primary-600">@mnit.ac.in</span> email.
          </p>
        </div>

        <div className="glass-card p-8 bento-border">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  placeholder="Your password"
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
            </div>

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
                  Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-foreground/60 mt-6">
            First time here?{' '}
            <Link href="/signup" className="font-bold text-primary-600 hover:text-primary-900 transition-colors">
              Create an Account
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/market" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors uppercase tracking-widest font-bold">
              Browse Market without logging in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
