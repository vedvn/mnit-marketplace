'use client';

import { useState } from 'react';
import { User, Phone, Landmark, Hash, Smartphone, Loader2, CheckCircle2, X, Building2 } from 'lucide-react';
import { updateUserProfile, updateUserFinancials } from '@/lib/profile-actions';

interface EditProfileFormProps {
  initialData: {
    name: string;
    phone_number?: string;
    bank_account_number?: string;
    bank_ifsc?: string;
    upi_id?: string;
  };
}

export default function EditProfileForm({ initialData }: EditProfileFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>(initialData.upi_id ? 'upi' : 'bank');
  const [formData, setFormData] = useState({
    name: initialData.name,
    phone_number: initialData.phone_number || '',
    bank_account_number: initialData.bank_account_number || '',
    bank_ifsc: initialData.bank_ifsc || '',
    upi_id: initialData.upi_id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Collect data directly from form for zero-lag uncontrolled experience
      const target = e.target as HTMLFormElement;
      const name = (target.elements.namedItem('name') as HTMLInputElement).value;
      const phone = (target.elements.namedItem('phone_number') as HTMLInputElement).value;
      const upi = (target.elements.namedItem('upi_id') as HTMLInputElement)?.value || '';
      const bankAcc = (target.elements.namedItem('bank_account_number') as HTMLInputElement)?.value || '';
      const bankIfsc = (target.elements.namedItem('bank_ifsc') as HTMLInputElement)?.value || '';

      // 1. Update Public Profile (Name)
      if (name !== initialData.name) {
        const profileRes = await updateUserProfile(name);
        if (profileRes.error) throw new Error(profileRes.error);
      }

      // 2. Update Financial PII (Correctly handling the chosen payout method)
      const financialData = new FormData();
      financialData.append('phone_number', phone);
      financialData.append('upi_id', payoutMethod === 'upi' ? upi : '');
      financialData.append('bank_account_number', payoutMethod === 'bank' ? bankAcc : '');
      financialData.append('bank_ifsc', payoutMethod === 'bank' ? bankIfsc : '');

      const financialRes = await updateUserFinancials(financialData);
      if (financialRes.error) throw new Error(financialRes.error);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs uppercase tracking-widest transition-all border border-black/5"
      >
        Edit My Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass-card rounded-[2.5rem] border border-white/20 p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/10 text-foreground/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Manage Identity & Payouts</h2>
              <p className="text-foreground/50 text-sm">Updated details will be used for your next payout.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Public Identity */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 px-1">Public Identity</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                      <input
                        name="name"
                        defaultValue={initialData.name}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-foreground/5 border border-black/5 focus:border-primary-600 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                      <input
                        name="phone_number"
                        defaultValue={initialData.phone_number}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-foreground/5 border border-black/5 focus:border-primary-600 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30 px-1">Payout Details (Private)</p>

                {/* payoutMethod Toggle */}
                <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${payoutMethod === 'upi' ? 'bg-white shadow text-primary-600' : 'text-foreground/50 hover:text-foreground'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${payoutMethod === 'bank' ? 'bg-white shadow text-primary-600' : 'text-foreground/50 hover:text-foreground'
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Bank A/C
                  </button>
                </div>

                <div className="space-y-4">
                  {payoutMethod === 'upi' ? (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">UPI ID</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          name="upi_id"
                          placeholder="yourname@upi"
                          defaultValue={initialData.upi_id}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-foreground/5 border border-black/5 focus:border-primary-600 outline-none text-sm font-mono transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Bank Account</label>
                        <div className="relative">
                          <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                          <input
                            name="bank_account_number"
                            defaultValue={initialData.bank_account_number}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-foreground/5 border border-black/5 focus:border-primary-600 outline-none text-sm transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">IFSC Code</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                          <input
                            name="bank_ifsc"
                            defaultValue={initialData.bank_ifsc}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-foreground/5 border border-black/5 focus:border-primary-600 outline-none text-sm font-mono tracking-widest transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <p className="text-[10px] text-foreground/30 max-w-[200px] leading-relaxed italic">
                  Changes to payout info will take effect for future transactions.
                </p>
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${success ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                      'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 disabled:opacity-50'
                    }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    success ? <><CheckCircle2 className="w-4 h-4" /> Profile Updated</> :
                      'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
