'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Send, X, ChevronDown, ShieldCheck, ShoppingBag, Tag } from 'lucide-react';
import { raiseDispute } from '@/lib/profile-actions';

export interface DisputeItem {
  id: string; // productId
  title: string;
  txId?: string;
  role: 'buyer' | 'seller';
}

interface DisputeFormProps {
  transactionId?: string | null;
  productId?: string | null;
  productTitle?: string | null;
  availableItems?: DisputeItem[];
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function DisputeForm({
  transactionId,
  productId,
  productTitle,
  availableItems = [],
  triggerLabel = "Need Help / Raise Dispute",
  triggerClassName
}: DisputeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<'general' | 'purchase' | 'listing' | null>(null);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [preferredResolution, setPreferredResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For generalized form
  const [selectedIndex, setSelectedIndex] = useState<number | 'none'>('none');

  // Filtered items based on report type
  const purchaseItems = availableItems.map((item, idx) => ({ ...item, originalIdx: idx })).filter(item => item.role === 'buyer');
  const listingItems = availableItems.map((item, idx) => ({ ...item, originalIdx: idx })).filter(item => item.role === 'seller');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !preferredResolution) {
      setError('Please select an issue category and preferred resolution.');
      return;
    }

    setLoading(true);
    setError(null);

    let finalTxId = transactionId || null;
    let finalProductId = productId || null;

    if (selectedIndex !== 'none' && availableItems[selectedIndex as number]) {
      const item = availableItems[selectedIndex as number];
      finalProductId = item.id;
      finalTxId = item.txId || null;
    }

    const result = await raiseDispute(finalTxId, finalProductId, reason, category, preferredResolution);

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
        setCategory('');
        setPreferredResolution('');
        setSelectedIndex('none');
        setReportType(null);
      }, 3000);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={triggerClassName || "px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 mt-2 border border-red-200"}
      >
        <AlertTriangle className="w-3.5 h-3.5" /> {triggerLabel}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 pt-24 sm:pt-6 overflow-y-auto">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl border border-black/10 shadow-2xl relative animate-in zoom-in-95 duration-200 mb-6">
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
          <h2 className="text-xl font-bold mb-1">Support Ticket</h2>
          <p className="text-xs text-foreground/60 font-medium">
            {productId ? `Related Item: ${productTitle}` : 'Universal Support Hub'}
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Ticket Submitted</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Your message has been encrypted and sent to the moderation team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Report Type Selection */}
            {!productId && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                  Step 1: What is this about?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'general', label: 'General', icon: ShieldCheck },
                    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
                    { id: 'listing', label: 'Listing', icon: Tag }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setReportType(type.id as any);
                        setSelectedIndex('none');
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${reportType === type.id
                          ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                          : 'bg-foreground/5 text-foreground/50 border-black/5 hover:bg-foreground/10 text-xs'
                        }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Item Selection (Only for purchase/listing) */}
            {!productId && (reportType === 'purchase' || reportType === 'listing') && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                  Step 2: Select the {reportType === 'purchase' ? 'Purchase' : 'Listing'}
                </label>
                <div className="relative">
                  <select
                    required
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(e.target.value === 'none' ? 'none' : parseInt(e.target.value))}
                    className="w-full p-4 pr-12 rounded-2xl bg-foreground/5 border border-black/5 outline-none text-xs font-semibold appearance-none transition-all focus:border-red-500/50"
                  >
                    <option value="none">Select from your items...</option>
                    {(reportType === 'purchase' ? purchaseItems : listingItems).map((item) => (
                      <option key={`${item.id}-${item.originalIdx}`} value={item.originalIdx}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                </div>
                {(reportType === 'purchase' ? purchaseItems : listingItems).length === 0 && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">You don't have any recent {reportType}s to report.</p>
                )}
              </div>
            )}

            {(reportType || productId) && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                      Issue Type
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 pr-10 rounded-xl bg-foreground/5 border border-black/5 outline-none text-[11px] font-bold appearance-none transition-all focus:border-red-500/50"
                      >
                        <option value="">Select Issue</option>
                        <option value="Item Not Received">Item Not Received</option>
                        <option value="Condition/Fake">Not as Described</option>
                        <option value="Payment Issue">Payment Problem</option>
                        <option value="User Behavior">Communication</option>
                        <option value="Scam/Fraud">Scam / Fraud</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                      Desired Fix
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={preferredResolution}
                        onChange={(e) => setPreferredResolution(e.target.value)}
                        className="w-full p-3 pr-10 rounded-xl bg-foreground/5 border border-black/5 outline-none text-[11px] font-bold appearance-none transition-all focus:border-emerald-500/50"
                      >
                        <option value="">Select Outcome</option>
                        <option value="Full Refund">Full Refund</option>
                        <option value="Partial Refund">Partial Refund</option>
                        <option value="Staff Help">Staff Intervention</option>
                        <option value="User Warning">User Warning</option>
                        <option value="Just Reporting">Just Reporting</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                    Detailed Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain what happened... (Encrypted)"
                    className="w-full p-4 rounded-2xl bg-foreground/5 border border-black/5 focus:border-red-500 outline-none text-sm transition-all resize-none"
                  />
                  <p className="text-[10px] text-foreground/30 italic">
                    Min. 10 characters required for encryption.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold border border-red-500/10 animate-in shake duration-300">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || reason.length < 10 || (reportType !== 'general' && !productId && selectedIndex === 'none')}
                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-red-500/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Ticket</>}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
