'use client';

import { useState, useEffect } from 'react';
import { getAdminDashboardData, adminBanUser, adminUnbanUser, adminDeleteTransaction } from '@/lib/admin-actions';
import { getPendingProducts, approveProduct, rejectProduct } from '@/lib/employee-actions';
import { Loader2, ShieldAlert, Ban, Unlock, Mail, TrendingUp, IndianRupee, Users, Trash2 } from 'lucide-react';

export default function ClientAdmin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'sellers' | 'verification' | 'broadcast'>('analytics');
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastData, setBroadcastData] = useState({
    policyType: 'Terms & Conditions',
    updatedDate: '',
    summaryOfChanges: ''
  });

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
          {['analytics', 'sellers', 'verification', 'broadcast'].map(tab => (
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
                    <th className="pb-3 px-4 font-bold">Date</th>
                    <th className="pb-3 px-4 font-bold">Amount</th>
                    <th className="pb-3 px-4 font-bold">Fee</th>
                    <th className="pb-3 px-4 font-bold">Pay Status</th>
                    <th className="pb-3 px-4 font-bold">Method</th>
                    <th className="pb-3 px-4 font-bold">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {dashboardData?.transactions?.slice(0, 20).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-foreground/5">
                      <td className="py-4 px-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-bold text-emerald-600">₹{tx.amount_paid}</td>
                      <td className="py-4 px-4 text-primary-600">₹{tx.platform_fee}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${tx.payment_status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                          {tx.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground/60">{tx.payment_method || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                          title="Delete transaction"
                        >
                          {actionLoading === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!dashboardData?.transactions || dashboardData.transactions.length === 0) && (
                    <tr><td colSpan={6} className="py-8 justify-center text-center text-foreground/50">No transactions recorded yet.</td></tr>
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
