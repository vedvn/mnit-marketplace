'use client';

import { useState } from 'react';
import { updateUserPassword } from '@/lib/auth-actions';
import { ShieldCheck, KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateUserPassword(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm text-xl font-black tracking-tighter">MNIT</span>
            <span className="text-foreground text-xl font-black tracking-tighter">MARKETPLACE</span>
          </div>
          <h1 className="text-2xl display-title uppercase mb-2">Create New Password</h1>
          <p className="text-foreground/60 text-sm">
            Your identity has been verified. Please choose a strong new password.
          </p>
        </div>

        <div className="glass-card p-8 bento-border">
          {success ? (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Password Updated</h2>
              <p className="text-sm text-foreground/60 mb-8">
                Your password has been changed successfully. You can now log in with your new credentials.
              </p>
              <Link
                href="/login"
                className="block w-full py-4 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/80 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3 animate-in shake duration-300">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="mono-subtitle">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
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

              <div className="p-4 rounded-xl bg-primary-600/5 border border-primary-600/10 mb-2">
                <ul className="text-[10px] text-foreground/60 space-y-1 ml-4 list-disc font-medium">
                  <li>At least 8 characters long</li>
                  <li>Mix of letters, numbers & symbols</li>
                  <li>Don't use your name or birthdate</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update & Protect Account</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
