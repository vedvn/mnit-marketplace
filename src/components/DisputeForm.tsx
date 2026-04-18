'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Send, X } from 'lucide-react';
import { raiseDispute } from '@/lib/profile-actions';

interface DisputeFormProps {
  transactionId: string;
  productId: string;
  productTitle: string;
}

export default function DisputeForm({ transactionId, productId, productTitle }: DisputeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await raiseDispute(transactionId, productId, reason);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setReason('');
      }, 3000);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-red-500 transition-colors flex items-center gap-1 mt-2"
      >
        <AlertTriangle className="w-3 h-3" /> Raise Dispute
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-black/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-1">Raise a Dispute</h2>
          <p className="text-sm text-foreground/60 italic font-medium truncate">
            Item: {productTitle}
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Dispute Filed</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Your ticket has been encrypted and sent to the management team. We will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Reason for Dispute
              </label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what happened... (e.g., item not as described, seller was rude, etc.)"
                className="w-full p-4 rounded-2xl bg-foreground/5 border border-black/5 focus:border-red-500 outline-none text-sm transition-all resize-none"
              />
              <p className="text-[10px] text-foreground/40 italic">
                Admins and employees will review this message. It is stored securely.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold border border-red-500/10 animate-in shake duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || reason.length < 10}
              className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Ticket</>}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
