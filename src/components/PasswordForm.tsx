'use client';

import { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

interface PasswordFormProps {
  title: string;
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function PasswordForm({ title, action }: PasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm glass-card p-10 text-center bento-border shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center mx-auto mb-6 rounded-full">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 display-title uppercase">{title}</h1>
        <p className="text-foreground/60 text-sm mb-8">
          This area is restricted. Please enter the secondary authorization password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            required
            placeholder="Enter password..."
            className="w-full p-4 bg-foreground/5 bento-border focus:border-red-500 outline-none text-center font-mono tracking-widest transition-colors"
          />

          {error && (
            <p className="text-sm font-bold text-red-500 mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex items-center justify-center gap-2 w-full py-4 bg-red-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50 mt-2 rounded-xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>Verify Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
