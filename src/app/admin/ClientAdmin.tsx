'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import { getAdminDashboardData, adminBanUser, adminUnbanUser, adminDeleteTransaction, adminCreateCategory, adminDeleteCategory, adminUpdatePayoutStatus, getDisputeData, adminResolveDispute, adminDeleteProduct, adminUpdateGlobalSettings } from '@/lib/admin-actions';
import { getPendingProducts, approveProduct, rejectProduct } from '@/lib/employee-actions';
import { Loader2, ShieldAlert, ShieldCheck, Ban, Unlock, Mail, TrendingUp, IndianRupee, Users, Trash2, Tag, PlusCircle, ChevronDown, ChevronUp, CheckCircle2, Clock, CreditCard, ExternalLink, Phone, Copy, Check, AlertTriangle, PieChart as PieChartIcon, Activity, HardHat, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export default function ClientAdmin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'sellers' | 'verification' | 'broadcast' | 'categories' | 'disputes' | 'listings' | 'banned' | 'buyers' | 'system'>('analytics');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [handleUpdateLoading, setHandleUpdateLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Diverse Premium Color Palette
  const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // DATA PROCESSING FOR ANALYTICS
  const timeSeriesData = useMemo(() => {
    if (!dashboardData?.transactions) return [];

    // Last 30 days of dates
    const dates = Array.from({ length: 30 }, (_: any, i: number) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dataMap: Record<string, number> = {};
    dates.forEach((d: string) => dataMap[d] = 0);

    dashboardData.transactions.forEach((tx: any) => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      if (dataMap[date] !== undefined) {
        dataMap[date] += Number(tx.amount_paid);
      }
    });

    return dates.map((date: string) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: dataMap[date]
    }));
  }, [dashboardData]);

  const categoryDistribution = useMemo(() => {
    if (!dashboardData?.categoryStats || !dashboardData?.categories) return [];

    const statsMap: Record<string, number> = {};
    dashboardData.categoryStats.forEach((p: any) => {
      if (p.status === 'AVAILABLE') {
        statsMap[p.category_id] = (statsMap[p.category_id] || 0) + 1;
      }
    });

    return dashboardData.categories.map((cat: any) => ({
      name: cat.name,
      value: statsMap[cat.id] || 0
    })).filter((c: any) => c.value > 0);
  }, [dashboardData]);

  const bannedAccounts = useMemo(() => {
    return (dashboardData?.allUsers || []).filter((u: any) => u.is_banned);
  }, [dashboardData]);

  const registeredBuyers = useMemo(() => {
    if (!dashboardData?.allUsers || !dashboardData?.allProducts) return [];

    // Find users who have NO 'AVAILABLE' or 'SOLD' products
    const sellerIdsWithSales = new Set(
      dashboardData.allProducts
        .filter((p: any) => p.status === 'AVAILABLE' || p.status === 'SOLD')
        .map((p: any) => p.seller_id)
    );

    return dashboardData.allUsers.filter((u: any) =>
      !u.is_admin &&
      !u.is_employee &&
      !u.is_banned &&
      !sellerIdsWithSales.has(u.id)
    );
  }, [dashboardData]);

  // Sellers are those with at least one active listing
  const activeSellers = useMemo(() => {
    const sellerIdsWithSales = new Set(
      dashboardData?.allProducts
        ?.filter((p: any) => p.status === 'AVAILABLE' || p.status === 'SOLD')
        .map((p: any) => p.seller_id) || []
    );
    return (dashboardData?.allUsers || []).filter((u: any) => sellerIdsWithSales.has(u.id) && !u.is_banned);
  }, [dashboardData]);

  const payoutHealth = useMemo(() => {
    if (!dashboardData?.transactions) return [];

    const stats = {
      COMPLETED: 0,
      SCHEDULED: 0,
      PENDING: 0
    };

    dashboardData.transactions.forEach((tx: any) => {
      if (tx.payout_status === 'COMPLETED') stats.COMPLETED++;
      else if (tx.payout_status === 'SCHEDULED') stats.SCHEDULED++;
      else stats.PENDING++;
    });

    return [
      { name: 'Completed', value: stats.COMPLETED, fill: '#10b981' },
      { name: 'Scheduled', value: stats.SCHEDULED, fill: '#3b82f6' },
      { name: 'Pending', value: stats.PENDING, fill: '#f59e0b' }
    ];
  }, [dashboardData]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'disputes') {
      fetchDisputes();
    }
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    const data = await getAdminDashboardData();
    const prods = await getPendingProducts();
    setDashboardData(data);
    setProducts(prods);
    setLoading(false);
  }

  async function fetchDisputes() {
    const data = await getDisputeData();
    setDisputes(data as any[]);
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

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  async function handleUnban(id: string) {
    if (!confirm('Are you sure you want to unban this user?')) return;
    setActionLoading(id);
    await adminUnbanUser(id);
    await fetchData();
    setActionLoading(null);
  }

  async function handleDeleteProduct(id: string, title: string) {
    const reason = prompt(`Why are you deleting "${title}"? This will send an email to the seller.`, "Violation of marketplace policy");
    if (reason === null) return;

    setActionLoading(id);
    await adminDeleteProduct(id, reason);
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

  async function handleResolveDispute(disputeId: string, status: 'RESOLVED' | 'REJECTED', resolution: string) {
    if (!resolution.trim()) return alert("Please provide a resolution note.");
    setActionLoading(disputeId);
    await adminResolveDispute(disputeId, status, resolution);
    await fetchDisputes();
    setActionLoading(null);
  }

  async function handleUpdateSystem(updates: any) {
    setHandleUpdateLoading(true);
    const res = await adminUpdateGlobalSettings(updates);
    if (res.error) alert(res.error);
    await fetchData();
    setHandleUpdateLoading(false);
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

        {/* Tab Nav - Desktop */}
        <div className="hidden lg:flex flex-wrap gap-2 p-1 bg-foreground/5 rounded-xl self-start md:self-auto">
          {['analytics', 'listings', 'sellers', 'buyers', 'banned', 'categories', 'verification', 'disputes', 'broadcast', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Nav - Mobile Dropdown */}
        <div className="lg:hidden w-full relative group">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full p-4 bg-foreground/5 bento-border rounded-xl font-bold uppercase tracking-widest text-xs appearance-none outline-none focus:border-primary-600"
          >
            <option value="analytics">Analytics & Fees</option>
            <option value="listings">All Listings</option>
            <option value="sellers">Active Sellers</option>
            <option value="buyers">Registered Buyers</option>
            <option value="banned">Banned Accounts</option>
            <option value="categories">Market Categories</option>
            <option value="verification">Listing Verification</option>
            <option value="disputes">Resolution Tickets</option>
            <option value="broadcast">Policy Broadcast</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center">
              <IndianRupee className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Volume</p>
              <p className="text-2xl font-black">₹{dashboardData?.totals.amountCollected.toLocaleString()}</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-5 h-5 text-primary-500 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Platform Fees</p>
              <p className="text-2xl font-black">₹{dashboardData?.totals.platformFees.toLocaleString()}</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bento-border flex flex-col items-center justify-center text-center">
              <Users className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Active Sellers</p>
              <p className="text-2xl font-black">{activeSellers.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Sales Volume Linear Trend */}
            <div className="glass-card p-6 rounded-2xl bento-border h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">30-Day Trading Volume</h3>
                </div>
                <div className="text-sm font-black text-emerald-600">
                  ₹{timeSeriesData.reduce((acc: number, curr: any) => acc + curr.volume, 0).toLocaleString()}
                </div>
              </div>
              <div className="flex-1 w-full -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)', fontWeight: 'bold' }}
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)', fontWeight: 'bold' }}
                      tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category Breakdown Pie */}
              <div className="glass-card p-6 rounded-2xl bento-border flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <PieChartIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">Market Categories</h3>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black">{categoryDistribution.reduce((acc: number, curr: any) => acc + curr.value, 0)}</span>
                    <span className="text-[8px] uppercase font-bold text-foreground/30">Listings</span>
                  </div>
                </div>
              </div>

              {/* Transaction Health Bar */}
              <div className="glass-card p-6 rounded-2xl bento-border flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">Payout Health</h3>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payoutHealth} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" hide />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {payoutHealth.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2 uppercase font-bold text-foreground/40">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          {item.name}
                        </div>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl bento-border mt-8">
            <h3 className="font-bold uppercase tracking-wider mb-6 pb-4 border-b border-black/5 px-6 pt-6 text-sm">Recent Transactions</h3>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-foreground/50 uppercase tracking-wider border-b border-black/5 bg-foreground/5">
                    <th className="py-3 px-6 font-bold">Product</th>
                    <th className="py-3 px-6 font-bold">Buyer</th>
                    <th className="py-3 px-6 font-bold">Seller</th>
                    <th className="py-3 px-6 font-bold">Amount</th>
                    <th className="py-3 px-6 font-bold">Payment</th>
                    <th className="py-3 px-6 font-bold text-right text-[10px]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {dashboardData?.transactions?.slice(0, 30).map((tx: any) => (
                    <Fragment key={tx.id}>
                      <tr className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedTx === tx.id ? 'bg-foreground/5' : ''}`} onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                        <td className="py-4 px-6 font-medium max-w-[150px] truncate">{tx.product?.title || 'Unknown'}</td>
                        <td className="py-4 px-6">
                            <div className="text-xs font-bold">{tx.buyer?.name}</div>
                            <div className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold">{tx.buyer?.email}</div>
                        </td>
                        <td className="py-4 px-6">
                            <div className="text-xs font-bold">{tx.seller?.name}</div>
                            <div className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold">{tx.seller?.email}</div>
                        </td>
                        <td className="py-4 px-6 font-black text-emerald-600">₹{tx.amount_paid}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${tx.payment_status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                            {tx.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {expandedTx === tx.id ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </td>
                      </tr>

                      {expandedTx === tx.id && (
                        <tr className="bg-foreground/0.02 animate-in slide-in-from-top-2 duration-200">
                          <td colSpan={6} className="p-0 border-b border-black/5">
                            <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Buyer Info */}
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                  <Users className="w-3.5 h-3.5" /> Buyer Details
                                </h4>
                                <div className="space-y-2 p-3 rounded-xl bg-foreground/5 border border-black/5">
                                  <p className="font-bold text-sm">{tx.buyer?.name}</p>
                                  <p className="text-[11px] text-foreground/60">{tx.buyer?.email}</p>
                                  {tx.buyer?.phone_number && <p className="text-[11px] text-foreground/60 flex items-center gap-1"><Phone className="w-3 h-3" /> {tx.buyer.phone_number}</p>}
                                </div>
                              </div>

                              {/* Seller & Payout Info */}
                              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:border-l lg:border-black/5 lg:pl-8">
                                <div className="space-y-4">
                                  <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                    <CreditCard className="w-3.5 h-3.5" /> Seller Payout Info
                                  </h4>
                                  <div className="space-y-3 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                                    {tx.seller?.upi_id ? (
                                      <div>
                                        <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-1">UPI ID</p>
                                        <div className="flex items-center gap-2">
                                          <p className="font-mono text-xs sm:text-sm font-bold bg-white px-2 py-1 rounded inline-block bento-border shrink-0">{tx.seller.upi_id}</p>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(tx.seller.upi_id, `upi-${tx.id}`); }}
                                            className="p-1.5 rounded-md hover:bg-foreground/5 text-primary-600 transition"
                                          >
                                            {copiedId === `upi-${tx.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-1">Account Number</p>
                                          <div className="flex items-center gap-2">
                                            <p className="font-mono text-xs sm:text-sm font-bold truncate">{tx.seller?.bank_account_number || 'N/A'}</p>
                                            {tx.seller?.bank_account_number && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleCopy(tx.seller.bank_account_number, `bank-${tx.id}`); }}
                                                className="p-1 rounded hover:bg-foreground/5 text-primary-600 transition"
                                              >
                                                {copiedId === `bank-${tx.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[10px] uppercase font-bold text-primary-600/60 mb-1">IFSC Code</p>
                                          <p className="font-mono text-xs sm:text-sm font-bold uppercase">{tx.seller?.bank_ifsc || 'N/A'}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-foreground/40 space-y-0.5 border-t border-black/5 pt-2">
                                    <p>Seller: <span className="font-bold text-foreground/70">{tx.seller?.name}</span></p>
                                  </div>
                                </div>

                                <div className="space-y-4 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Payout Amount</h4>
                                    <p className="text-2xl sm:text-3xl font-black text-primary-600">₹{tx.seller_payout}</p>
                                    <p className="text-[10px] text-foreground/40 italic">Charged to buyer: ₹{tx.amount_paid}</p>
                                  </div>

                                  <div className="flex flex-col gap-2 pt-4">
                                    {tx.payment_status === 'SUCCESS' && tx.payout_status !== 'COMPLETED' && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handlePayoutStatus(tx.id, 'COMPLETED'); }}
                                        disabled={actionLoading === tx.id || tx.payout_status === 'PENDING'}
                                        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 disabled:grayscale transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                                      >
                                        {actionLoading === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Complete Payout</>}
                                      </button>
                                    )}

                                    {tx.payout_status === 'PENDING' && (
                                      <p className="text-[10px] bg-amber-500/10 text-amber-700 p-3 rounded-xl font-medium leading-relaxed border border-amber-500/20">
                                        Waiting for buyer confirmation.
                                      </p>
                                    )}

                                    {tx.payout_status === 'COMPLETED' && (
                                      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                        <CheckCircle2 className="w-4 h-4" /> Payout Finished
                                      </div>
                                    )}

                                    <button
                                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this transaction?')) handleDeleteTx(tx.id); }}
                                      className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-600 transition mt-2"
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
                    <tr><td colSpan={6} className="py-12 text-center text-foreground/50 italic">No transactions recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SELLERS TAB */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">Verified Sellers ({activeSellers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSellers.map((seller: any) => (
              <div key={seller.id} className="glass-card p-6 rounded-2xl bento-border transition hover:border-primary-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">{seller.name}</h3>
                      <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold truncate max-w-[150px] sm:max-w-xs">{seller.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-100">
                    <select
                      id={`ban-duration-${seller.id}`}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none text-red-600 cursor-pointer"
                      defaultValue="7"
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="365">1 Year</option>
                      <option value="permanent">Permanent</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById(`ban-duration-${seller.id}`) as HTMLSelectElement;
                        const duration = select.value === 'permanent' ? null : parseInt(select.value);
                        handleBan(seller.id, duration);
                      }}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                      title="Ban User"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-foreground/60 border-t border-black/5 pt-4 mt-4">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {seller.phone_number || 'No Phone'}</div>
                  <div className="flex items-center gap-1.5 uppercase tracking-widest text-[9px]">ID: {seller.id.slice(0, 8)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUYERS TAB */}
      {activeTab === 'buyers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-black uppercase tracking-tighter">Registered Buyers ({registeredBuyers.length})</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-left sm:text-right">Users without successful listings / Rejected sellers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredBuyers.map((buyer: any) => (
              <div key={buyer.id} className="glass-card p-6 rounded-2xl bento-border transition hover:border-blue-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">{buyer.name}</h3>
                      <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold truncate max-w-[150px] sm:max-w-xs">{buyer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-100">
                    <select
                      id={`ban-duration-${buyer.id}`}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none text-red-600 cursor-pointer"
                      defaultValue="7"
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="365">1 Year</option>
                      <option value="permanent">Permanent</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById(`ban-duration-${buyer.id}`) as HTMLSelectElement;
                        const duration = select.value === 'permanent' ? null : parseInt(select.value);
                        handleBan(buyer.id, duration);
                      }}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                      title="Ban User"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-foreground/60 border-t border-black/5 pt-4 mt-4">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {buyer.phone_number || 'No Phone'}</div>
                  <div className="flex items-center gap-1.5 uppercase tracking-widest text-[9px]">Joined: {new Date(buyer.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">Global Listings ({dashboardData?.allProducts.length})</h2>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Item</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-4">Seller</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-4">Status</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {dashboardData?.allProducts.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-foreground/0.02 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-sm">{p.title}</div>
                      <div className="text-[10px] font-black text-emerald-600">₹{p.price.toLocaleString()}</div>
                      <div className="text-[9px] text-foreground/30 uppercase font-bold tracking-widest">{p.category_id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-bold">{p.seller?.name}</div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-foreground/40">{p.seller?.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${p.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                          p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                        }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        disabled={actionLoading === p.id}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-700 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANNED TAB */}
      {activeTab === 'banned' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">Banned Accounts ({bannedAccounts.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bannedAccounts.map((user: any) => {
              const isPermanent = !user.banned_until;
              let timeLeftString = "Permanent";

              if (!isPermanent) {
                const diff = new Date(user.banned_until).getTime() - new Date().getTime();
                if (diff > 0) {
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  timeLeftString = `${days}d ${hours}h left`;
                } else {
                  timeLeftString = "Expiring soon";
                }
              }

              return (
                <div key={user.id} className="glass-card p-6 rounded-2xl border-2 border-red-500/10 transition hover:bg-red-500/2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-600 text-sm sm:text-base">{user.name}</h3>
                        <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold truncate max-w-[150px] sm:max-w-xs">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnban(user.id)}
                      disabled={actionLoading === user.id}
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Unlock className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold border-t border-black/5 pt-4 mt-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-widest text-[9px] font-black">{timeLeftString}</span>
                    </div>
                    <div className="text-foreground/30 text-[9px] uppercase tracking-widest truncate max-w-[100px]">ID: {user.id.slice(0, 8)}</div>
                  </div>
                </div>
              );
            })}
            {bannedAccounts.length === 0 && (
              <div className="col-span-full p-20 text-center glass-card rounded-2xl border border-black/5 text-foreground/30 font-bold uppercase tracking-[0.2em]">
                Clean Record - No users banned
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERIFICATION TAB (re-used logic) */}
      {activeTab === 'verification' && (
        products.length === 0 ? (
          <div className="p-10 text-center glass-card rounded-2xl border border-black/5 text-foreground/60">
            No items pending verification.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="glass-card p-4 sm:p-6 rounded-2xl border border-black/5 flex flex-col shadow-sm">
                <div className="flex gap-4 mb-4 items-start">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0 bento-border">
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base line-clamp-1">{product.title}</h4>
                    <p className="text-primary-600 font-bold text-xs sm:text-sm mb-1">₹{product.price}</p>
                    <p className="text-[10px] text-foreground/50 truncate">Seller: {product.seller?.name}</p>
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-4 border-t border-black/5">
                  <button onClick={() => handleReject(product.id)} disabled={actionLoading === product.id} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 transition-colors">
                    {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                  </button>
                  <button onClick={() => handleApprove(product.id)} disabled={actionLoading === product.id} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1 transition-colors shadow-md shadow-emerald-600/10">
                    {actionLoading === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="max-w-4xl space-y-8">
          <form onSubmit={handleCreateCategory} className="glass-card p-6 rounded-2xl border border-black/5 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">New Category Name</label>
              <input
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="e.g. Lab Equipment"
                className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 bento-border outline-none focus:border-primary-600 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={categoryActionLoading === 'create'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-700 transition disabled:opacity-50"
            >
              {categoryActionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Create
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
                <li key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-foreground/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    disabled={categoryActionLoading === cat.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-40"
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
              onChange={(e) => setBroadcastData({ ...broadcastData, policyType: e.target.value as any })}
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
              onChange={(e) => setBroadcastData({ ...broadcastData, updatedDate: e.target.value })}
              className="w-full p-3 bg-foreground/5 border border-black/5 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Summary of Changes</label>
            <textarea
              required
              rows={4}
              value={broadcastData.summaryOfChanges}
              onChange={(e) => setBroadcastData({ ...broadcastData, summaryOfChanges: e.target.value })}
              className="w-full p-3 bg-foreground/5 border border-black/5 rounded-xl outline-none focus:border-primary-500 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isBroadcasting}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
          >
            {isBroadcasting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Broadcast To Active Users'}
          </button>

          {broadcastSuccess && <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 font-medium text-sm text-center">{broadcastSuccess}</div>}
          {broadcastError && <div className="p-4 rounded-xl bg-red-500/10 text-red-700 font-medium text-sm text-center">{broadcastError}</div>}
        </form>
      )}

      {/* DISPUTES TAB */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Raised Tickets
            </h2>
            <button
              onClick={fetchDisputes}
              className="px-3 py-1.5 rounded-lg bg-foreground/5 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-colors"
            >
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {disputes.map((d) => (
              <div key={d.id} className="glass-card p-6 rounded-2xl border border-black/5 bento-border">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block ${d.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                          {d.status}
                        </span>
                        <h3 className="font-bold text-lg">{d.product?.title}</h3>
                        <p className="text-xs text-foreground/50">Dispute raised by {d.raised_by_user?.name} ({d.raised_by_user?.email})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-foreground/30">Amount</p>
                        <p className="font-bold text-emerald-600">₹{d.product?.price}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-foreground/5 border border-black/5">
                      <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Decrypted Reason
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80 italic">"{d.reason}"</p>
                    </div>

                    {d.resolution && (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 text-sm italic">
                        <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">Resolution Note:</span>
                        {d.resolution}
                      </div>
                    )}
                  </div>

                  {d.status === 'OPEN' && (
                    <div className="lg:w-80 space-y-4 pt-4 lg:pt-0 lg:border-l lg:pl-8 border-black/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Resolve Ticket</h4>
                      <textarea
                        id={`resolution-${d.id}`}
                        placeholder="Resolution summary..."
                        className="w-full p-3 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-emerald-500 text-xs resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const res = (document.getElementById(`resolution-${d.id}`) as HTMLTextAreaElement).value;
                            handleResolveDispute(d.id, 'REJECTED', res);
                          }}
                          disabled={actionLoading === d.id}
                          className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            const res = (document.getElementById(`resolution-${d.id}`) as HTMLTextAreaElement).value;
                            handleResolveDispute(d.id, 'RESOLVED', res);
                          }}
                          disabled={actionLoading === d.id}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                        >
                          {actionLoading === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {disputes.length === 0 && (
              <div className="p-12 text-center glass-card rounded-2xl border border-black/5 text-foreground/50">
                No disputes found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SYSTEM TAB */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">Global System Controls</h2>
            <div className="px-3 py-1 bg-primary-500/10 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full">
              Live Status
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode Toggle */}
            <div className="glass-card p-8 rounded-3xl border-2 border-black/5 bento-border flex flex-col justify-between group transition hover:border-black/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl shadow-black/20 transition group-hover:scale-110">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Maintenance Mode</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed mt-2">
                    Activating this will block all non-staff users from accessing the marketplace. Use this for major site updates or logic changes.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between p-4 bg-foreground/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dashboardData?.isMaintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    Currently: {dashboardData?.isMaintenanceMode ? 'Active' : 'Offline'}
                  </span>
                </div>
                <button
                  onClick={() => handleUpdateSystem({ is_maintenance_mode: !dashboardData?.isMaintenanceMode })}
                  disabled={handleUpdateLoading}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg ${dashboardData?.isMaintenanceMode 
                    ? 'bg-white text-black hover:bg-gray-100 shadow-white/10' 
                    : 'bg-black text-white hover:bg-black/80 shadow-black/10'}`}
                >
                  {handleUpdateLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (dashboardData?.isMaintenanceMode ? 'Disable' : 'Enable')}
                </button>
              </div>
            </div>

            {/* Buying Disable Toggle */}
            <div className="glass-card p-8 rounded-3xl border-2 border-black/5 bento-border flex flex-col justify-between group transition hover:border-black/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-600/20 transition group-hover:scale-110">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Global Purchases</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed mt-2">
                    Disabling this will prevent users from clicking &quot;Buy Now&quot;. They can still browse, list products, and communicate. Useful for payment platform transitions.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between p-4 bg-foreground/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dashboardData?.isBuyingDisabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    Status: {dashboardData?.isBuyingDisabled ? 'Payments Disabled' : 'Payments Live'}
                  </span>
                </div>
                <button
                  onClick={() => handleUpdateSystem({ is_buying_disabled: !dashboardData?.isBuyingDisabled })}
                  disabled={handleUpdateLoading}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg ${dashboardData?.isBuyingDisabled 
                    ? 'bg-white text-black hover:bg-gray-100 shadow-white/10' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/10'}`}
                >
                  {handleUpdateLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (dashboardData?.isBuyingDisabled ? 'Enable Buying' : 'Disable Buying')}
                </button>
              </div>
            </div>

            {/* Holiday Mode Toggle */}
            <div className="glass-card p-8 rounded-3xl border-2 border-black/5 bento-border flex flex-col justify-between group transition hover:border-black/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 transition group-hover:scale-110">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Holiday Mode</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed mt-2">
                    Gracefully close the marketplace for breaks. Users will see a festive landing page while staff retain full dashboard access.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between p-4 bg-foreground/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dashboardData?.isHolidayMode ? 'bg-emerald-500 animate-pulse' : 'bg-foreground/20'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    Mode: {dashboardData?.isHolidayMode ? 'Holiday Break' : 'Standard'}
                  </span>
                </div>
                <button
                  onClick={() => handleUpdateSystem({ is_holiday_mode: !dashboardData?.isHolidayMode })}
                  disabled={handleUpdateLoading}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg ${dashboardData?.isHolidayMode 
                    ? 'bg-white text-emerald-600 hover:bg-gray-100 shadow-white/10' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10'}`}
                >
                  {handleUpdateLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (dashboardData?.isHolidayMode ? 'Disable Holiday' : 'Enable Holiday')}
                </button>
              </div>
            </div>

            {/* Holiday Message Editor */}
            <div className="md:col-span-2 glass-card p-8 rounded-3xl border-2 border-black/5 bento-border flex flex-col group transition hover:border-black/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Holiday Announcement</h3>
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mt-1">Status: {dashboardData?.isHolidayMode ? 'Displayed to all users' : 'Hidden'}</p>
                  </div>
                </div>
                <div className="relative group">
                  <textarea
                    defaultValue={dashboardData?.holidayMessage}
                    onBlur={(e) => {
                      if (e.target.value !== dashboardData?.holidayMessage) {
                        handleUpdateSystem({ holiday_message: e.target.value });
                      }
                    }}
                    rows={2}
                    placeholder="Enter your festive message for the campus..."
                    className="w-full p-6 pb-12 rounded-2xl bg-foreground/5 border border-black/5 focus:border-emerald-500 outline-none text-sm transition-all resize-none italic"
                  />
                  <div className="absolute bottom-4 right-6 text-[9px] font-bold uppercase tracking-widest text-foreground/30 group-focus-within:text-emerald-500 transition-colors">
                    Auto-saves on blur
                  </div>
                </div>
              </div>
            </div>

            {/* System Health & Security */}
            <div className="md:col-span-2 glass-card p-8 rounded-3xl border-2 border-black/5 bento-border flex flex-col group transition hover:border-black/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/10">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Security & Health</h3>
                      <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mt-1">Audit Logs: Enabled · Janitor: Active</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/60 leading-relaxed max-w-xl">
                    Our automated Janitor sweeps the platform for expired sessions and abandoned data every time an admin logs in. You can also trigger a manual deep-clean below.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={async () => {
                      const { runSystemJanitor } = await import('@/lib/admin-janitor');
                      const res = await runSystemJanitor();
                      if (res.success) alert('Janitor successfully cleaned the system!');
                    }}
                    className="px-6 py-3 rounded-xl bg-white text-black border-2 border-black/5 hover:border-black/20 text-[10px] font-black uppercase tracking-widest transition shadow-xl"
                  >
                    Run System Cleanup
                  </button>
                  <div className="px-6 py-3 rounded-xl bg-foreground/5 text-foreground/40 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic">
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    Self-Healing Active
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">TTL Status</p>
                  <p className="text-xs font-bold text-emerald-600">Active Monitoring</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">Transaction Integrity</p>
                  <p className="text-xs font-bold text-emerald-600">Level 5 Hardening</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">Audit Trail</p>
                  <p className="text-xs font-bold text-emerald-600">Encrypted Logging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

