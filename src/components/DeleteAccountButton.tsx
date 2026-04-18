'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { requestAccountDeletion } from '@/lib/profile-actions';

export default function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await requestAccountDeletion();
    if (result.error) {
      alert(result.error);
      setLoading(false);
      setIsOpen(false);
    } else {
      // revalidatePath is handled server-side, component will re-render via ProfilePage
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-8 py-4 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
      >
        Request Account Deletion
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-card rounded-[2.5rem] border border-white/20 p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/10 text-foreground/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 text-red-600 flex items-center justify-center rounded-full mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold mb-3">Wait! Are you sure?</h3>
              <p className="text-foreground/60 text-sm leading-relaxed mb-8">
                Requesting account deletion will flag your account for permanent removal.
                As per India's DPDP Act, this process takes <strong>30 days</strong> to complete.
                During this time, you can still revoke the request by contacting support.
                Once finalized, all your data, listings, and history will be <strong>permanently purged</strong>.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Request Deletion'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-foreground/5 text-foreground/60 font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-all"
                >
                  No, Keep My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
