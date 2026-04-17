'use client';

import { useState, useEffect, Fragment } from 'react';
import { getAdminDashboardData, adminBanUser, adminUnbanUser, adminDeleteTransaction, adminCreateCategory, adminDeleteCategory, adminUpdatePayoutStatus } from '@/lib/admin-actions';
import { getPendingProducts, approveProduct, rejectProduct } from '@/lib/employee-actions';
import { Loader2, ShieldAlert, Ban, Unlock, Mail, TrendingUp, IndianRupee, Users, Trash2, Tag, PlusCircle, ChevronDown, ChevronUp, CheckCircle2, Clock, CreditCard, ExternalLink, Phone } from 'lucide-react';

export default function ClientAdmin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'sellers' | 'verification' | 'broadcast' | 'categories'>('analytics');
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastData, setBroadcastData] = useState({
    policyType: 'Terms & Conditions',
    updatedDate: '',
    summaryOfChanges: ''
  });

  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryActionLoading, setCategoryActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const data = await getAdminDashboardData();
    const prods = await getPendingProducts();
    setDashboardData(data);
    setProducts(prods);
    setLoading(false);
  }

  // Verification Actions
  async function handleApprove(id: string) {
    setActionLoading(id);
    await approveProduct(id);
    await fetchData();
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await rejectProduct(id);
    await fetchData();
    setActionLoading(null);
  }

  async function handlePayoutStatus(txId: string, status: 'PENDING' | 'SCHEDULED' | 'COMPLETED') {
    setActionLoading(txId);
    await adminUpdatePayoutStatus(txId, status);
    await fetchData();
    setActionLoading(null);
  }

  // Ban Actions
  async function handleBan(userId: string, duration: number | null) {
    const timeStr = duration ? `${duration} days` : 'PERMANENTLY';
    if (!confirm(`Are you sure you want to ban this user ${timeStr}?`)) return;
    setActionLoading(userId);
    await adminBanUser(userId, duration);
    await fetchData();
    setActionLoading(null);
  }

  async function handleUnban(userId: string) {
    if (!confirm("Remove ban from this user?")) return;
    setActionLoading(userId);
    await adminUnbanUser(userId);
    await fetchData();
    setActionLoading(null);
  }

  async function handleDeleteTx(txId: string) {
    if (!confirm('Are you sure you want to permanently delete this transaction? This cannot be undone.')) return;
    setActionLoading(txId);
    await adminDeleteTransaction(txId);
    await fetchData();
    setActionLoading(null);
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryActionLoading('create');
    await adminCreateCategory(newCategoryName);
    setNewCategoryName('');
    await fetchData();
    setCategoryActionLoading(null);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Delete this category? Products using it will need to be reassigned.')) return;
    setCategoryActionLoading(id);
    await adminDeleteCategory(id);
    await fetchData();
    setCategoryActionLoading(null);
  }

  // Broadcast Action
  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Are you sure you want to email ALL active users about the ${broadcastData.policyType} update?`)) return;
    
    setIsBroadcasting(true);
    setBroadcastSuccess(null);
    setBroadcastError(null);

    try {
      const res = await fetch('/api/email/policy-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || ''
        },
        body: JSON.stringify(broadcastData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      
      setBroadcastSuccess(`Successfully sent to ${data.sent} users.`);
      setBroadcastData({ policyType: 'Terms & Conditions', updatedDate: '', summaryOfChanges: '' });
    } catch (err: any) {
      setBroadcastError(err.message);
    } finally {
      setIsBroadcasting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Super Admin Hub</h1>
            <p className="text-foreground/70">Complete system oversight and moderation.</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 p-1 bg-foreground/5 rounded-xl self-start md:self-auto">
          {['analytics', 'sellers', 'categories', 'verification', 'broadcast'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center py-10">
              <IndianRupee className="w-8 h-8 text-emerald-500 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Trading Volume</p>
              <p className="text-4xl font-black">₹{dashboardData?.totals.amountCollected.toLocaleString()}</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center py-10">
              <TrendingUp className="w-8 h-8 text-primary-500 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Platform Fees Collected</p>
              <p className="text-4xl font-black">₹{dashboardData?.totals.platformFees.toLocaleString()}</p>
              <p className="text-xs text-foreground/40 mt-2">@ {dashboardData?.feePercent ?? 5}% per transaction</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center py-10">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Active Sellers</p>
              <p className="text-4xl font-black">{dashboardData?.sellers.length}</p>
            </div>
          </div>

    <div className="glass-card p-6 rounded-2xl bento-border mt-8">
      <h3 className="font-bold uppercase tracking-wider mb-6 pb-4 border-b border-black/5">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-foreground/50 uppercase tracking-wider border-b border-black/5">
              <th className="pb-3 px-4 font-bold">Product</th>
              <th className="pb-3 px-4 font-bold">Amount</th>
              <th className="pb-3 px-4 font-bold">Payment</th>
              <th className="pb-3 px-4 font-bold">Delivery</th>
              <th className="pb-3 px-4 font-bold">Payout</th>
              <th className="pb-3 px-4 font-bold text-right text-[10px]">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {dashboardData?.transactions?.slice(0, 30).map((tx: any) => (
              <Fragment key={tx.id}>
                <tr className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedTx === tx.id ? 'bg-foreground/5' : ''}`} onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                  <td className="py-4 px-4 font-medium max-w-[200px] truncate">{tx.product?.title || 'Unknown'}</td>
                  <td className="py-4 px-4 font-black text-emerald-600">₹{tx.amount_paid}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${tx.payment_status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                      {tx.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {tx.payout_status !== 'PENDING' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Received
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${tx.payout_status === 'COMPLETED' ? 'bg-primary-500/10 text-primary-700' : 'bg-foreground/10 text-foreground/50'}`}>
                      {tx.payout_status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {expandedTx === tx.id ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                  </td>
                </tr>

                {expandedTx === tx.id && (
                  <tr className="bg-foreground/[0.02] animate-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="p-0">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Buyer Info */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                             <Users className="w-3.5 h-3.5"/> Buyer Details
                          </h4>
                          <div className="space-y-1">
                            <p className="font-bold">{tx.buyer?.name}</p>
                            <p className="text-xs text-foreground/60">{tx.buyer?.email}</p>
                            {tx.buyer?.phone_number && <p className="text-xs text-foreground/60 flex items-center gap-1"><Phone className="w-3 h-3"/> {tx.buyer.phone_number}</p>}
                          </div>
                        </div>

                        {/* Seller & Payout Info */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 border-l border-black/5 pl-8">
                          <div className="space-y-4">
                             <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                               <CreditCard className="w-3.5 h-3.5"/> Seller Payout Info
                             </h4>
                             <div className="space-y-2 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                                {tx.seller?.upi_id ? (
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-0.5">UPI ID</p>
                                    <p className="font-mono text-sm font-bold bg-white px-2 py-1 rounded inline-block">{tx.seller.upi_id}</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-0.5">Account Number</p>
                                      <p className="font-mono text-sm font-bold">{tx.seller?.bank_account_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-0.5">IFSC Code</p>
                                      <p className="font-mono text-sm font-bold">{tx.seller?.bank_ifsc || 'N/A'}</p>
                                    </div>
                                  </div>
                                )}
                             </div>
                             <div className="text-[10px] text-foreground/40 space-y-0.5">
                                <p>Seller: <span className="font-bold text-foreground/70">{tx.seller?.name}</span></p>
                                <p>Contact: <span className="font-bold text-foreground/70">{tx.seller?.phone_number || tx.seller?.email}</span></p>
                             </div>
                          </div>

                          <div className="space-y-4 flex flex-col justify-between">
                             <div>
                               <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Payout Amount</h4>
                               <p className="text-2xl font-black text-primary-600">₹{tx.seller_payout}</p>
                               <p className="text-[10px] text-foreground/40 italic">Charged to buyer: ₹{tx.amount_paid}</p>
                             </div>

                             <div className="flex flex-col gap-2 pt-4">
                               {tx.payment_status === 'SUCCESS' && tx.payout_status !== 'COMPLETED' && (
                                 <button
                                   onClick={() => handlePayoutStatus(tx.id, 'COMPLETED')}
                                   disabled={actionLoading === tx.id || tx.payout_status === 'PENDING'}
                                   className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:grayscale transition-all flex items-center justify-center gap-2"
                                 >
                                   {actionLoading === tx.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle2 className="w-3.5 h-3.5"/> Complete Payout</>}
                                 </button>
                               )}
                               
                               {tx.payout_status === 'PENDING' && (
                                 <p className="text-[10px] bg-amber-500/10 text-amber-700 p-2 rounded-lg font-medium">
                                   Waiting for buyer to confirm receipt before payout can be processed.
                                 </p>
                               )}

                               {tx.payout_status === 'COMPLETED' && (
                                 <div className="flex items-center gap-2 py-2 px-3 bg-emerald-500/10 text-emerald-700 rounded-lg text-xs font-bold">
                                   <CheckCircle2 className="w-4 h-4"/> Payout Finished
                                 </div>
                               )}

                               <button
                                 onClick={() => { if(confirm('Delete this transaction?')) handleDeleteTx(tx.id); }}
                                 className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors mt-2"
                               >
                                 Delete Record
                               </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {(!dashboardData?.transactions || dashboardData.transactions.length === 0) && (
              <tr><td colSpan={6} className="py-12 text-center text-foreground/50">No transactions recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
        </div>
      )}

      {/* SELLERS TAB */}
      {activeTab === 'sellers' && (
        <div className="glass-card rounded-2xl bento-border overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 border-b border-black/5">
              <tr className="text-foreground/50 uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Seller</th>
                <th className="py-4 px-6 font-bold">Email</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 align-middle">
              {dashboardData?.sellers?.map((user: any) => (
                <tr key={user.id} className="hover:bg-foreground/5">
                  <td className="py-4 px-6 font-bold">{user.name}</td>
                  <td className="py-4 px-6 text-foreground/60">{user.email}</td>
                  <td className="py-4 px-6">
                    {user.is_banned ? (
                      <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-red-500/10 text-red-700 flex items-center gap-1 w-max">
                        <Ban className="w-3 h-3" /> {user.banned_until ? `Banned til ${new Date(user.banned_until).toLocaleDateString()}` : 'Permanently Banned'}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-emerald-500/10 text-emerald-700 w-max">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {user.is_banned ? (
                      <button 
                        onClick={() => handleUnban(user.id)}
                        disabled={actionLoading === user.id}
                        className="p-2 bg-foreground text-background rounded-lg hover:bg-foreground/80 transition-colors disabled:opacity-50 inline-flex"
                      >
                        {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Unlock className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className="inline-flex bg-background border border-black/10 p-1 rounded-lg gap-1">
                        <button onClick={() => handleBan(user.id, 7)} className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded">7D</button>
                        <button onClick={() => handleBan(user.id, 30)} className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 rounded">30D</button>
                        <button onClick={() => handleBan(user.id, null)} className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded">PERM</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VERIFICATION TAB (re-used logic) */}
      {activeTab === 'verification' && (
        products.length === 0 ? (
          <div className="p-10 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
            No items pending verification.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="glass-card p-6 rounded-2xl border border-black/5 flex flex-col">
                <div className="flex gap-4 mb-4 items-start">
                  <div className="w-20 h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0">
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover"/> : null}
                  </div>
                  <div>
                    <h4 className="font-bold line-clamp-1">{product.title}</h4>
                    <p className="text-primary-600 font-bold text-sm mb-1">₹{product.price}</p>
                    <p className="text-xs text-foreground/50">{product.seller?.name}</p>
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-4 border-t border-black/5">
                   <button onClick={() => handleReject(product.id)} disabled={actionLoading === product.id} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1">
                     {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Reject'}
                   </button>
                   <button onClick={() => handleApprove(product.id)} disabled={actionLoading === product.id} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1">
                     {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Approve'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleCreateCategory} className="glass-card p-6 rounded-2xl border border-black/5 flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">New Category Name</label>
              <input
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="e.g. Lab Equipment"
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={categoryActionLoading === 'create'}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {categoryActionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Add
            </button>
          </form>

          <div className="glass-card rounded-2xl border border-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5 flex items-center gap-2">
              <Tag className="w-4 h-4 text-foreground/40" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Current Categories</h3>
              <span className="ml-auto text-xs text-foreground/40 font-bold">{dashboardData?.categories?.length ?? 0} total</span>
            </div>
            <ul className="divide-y divide-black/5">
              {dashboardData?.categories?.map((cat: any) => (
                <li key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-foreground/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    disabled={categoryActionLoading === cat.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                    title="Delete category"
                  >
                    {categoryActionLoading === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </li>
              ))}
              {(!dashboardData?.categories || dashboardData.categories.length === 0) && (
                <li className="px-6 py-8 text-center text-foreground/40 text-sm">No categories yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* BROADCAST TAB */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} className="glass-card p-8 rounded-2xl max-w-2xl mx-auto space-y-6 border border-black/5">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6 text-foreground/50" />
            <h2 className="text-xl font-bold">Broadcast Policy Updates</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Policy Type</label>
            <select 
              value={broadcastData.policyType}
              onChange={(e) => setBroadcastData({...broadcastData, policyType: e.target.value as any})}
              className="w-full p-3 bg-foreground/5 border border-black/5 rounded-xl outline-none focus:border-primary-500"
            >
              <option value="Terms & Conditions">Terms & Conditions</option>
              <option value="Privacy Policy">Privacy Policy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Effective Date</label>
            <input 
              type="date" 
              required
              value={broadcastData.updatedDate}
              onChange={(e) => setBroadcastData({...broadcastData, updatedDate: e.target.value})}
              className="w-full p-3 bg-foreground/5 border border-black/5 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Summary of Changes</label>
            <textarea 
              required
              rows={4}
              value={broadcastData.summaryOfChanges}
              onChange={(e) => setBroadcastData({...broadcastData, summaryOfChanges: e.target.value})}
              className="w-full p-3 bg-foreground/5 border border-black/5 rounded-xl outline-none focus:border-primary-500 font-mono text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isBroadcasting}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            {isBroadcasting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Broadcast To Active Users'}
          </button>

          {broadcastSuccess && <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 font-medium text-sm text-center">{broadcastSuccess}</div>}
          {broadcastError && <div className="p-4 rounded-xl bg-red-500/10 text-red-700 font-medium text-sm text-center">{broadcastError}</div>}
        </form>
      )}

    </div>
  );
}
