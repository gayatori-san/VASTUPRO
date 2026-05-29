/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Settings, ShieldAlert, Coins, TrendingUp, 
  ShoppingBag, Trash2, Edit, Save, PlusCircle, CheckCircle, FileUp
} from 'lucide-react';
import { UserProfile, PurchaseOrder, ServiceItem, VastuReport, VA_SERVICES } from '../types';

interface AdminPanelProps {
  user: UserProfile | null;
  usersList: UserProfile[];
  orders: PurchaseOrder[];
  reports: VastuReport[];
  services: ServiceItem[];
  onUpdateUserCredits: (uid: string, newCredits: number) => void;
  onUpdateUserRole: (uid: string, newRole: 'user' | 'admin') => void;
  onUpdateServicePrice: (serviceId: string, newPrice: number) => void;
  onUploadManualReport: (report: VastuReport) => void;
}

export default function AdminPanel({
  user,
  usersList,
  orders,
  reports,
  services,
  onUpdateUserCredits,
  onUpdateUserRole,
  onUpdateServicePrice,
  onUploadManualReport
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'orders' | 'upload'>('users');
  const [editingService, setEditingService] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Manual report state
  const [reportForm, setReportForm] = useState({
    targetUserId: '',
    serviceId: 'vastu_audit',
    title: '',
    content: ''
  });

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const handleSavePrice = (serviceId: string) => {
    onUpdateServicePrice(serviceId, tempPrice);
    setEditingService(null);
  };

  const handleManualUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.targetUserId || !reportForm.title || !reportForm.content) {
      alert("Please provide target User ID, Title, and complete Markdown prescription.");
      return;
    }

    const manualReport: VastuReport = {
      reportId: 'REP_MAN_' + Math.round(Math.random() * 899999 + 100000),
      userId: reportForm.targetUserId,
      serviceId: reportForm.serviceId,
      title: reportForm.title,
      content: reportForm.content,
      inputs: { notes: "Manually uploaded by Administrator" },
      isPremium: true,
      createdAt: new Date().toISOString()
    };

    onUploadManualReport(manualReport);
    alert("Premium Astro report uploaded successfully to user profile.");
    setReportForm({
      targetUserId: '',
      serviceId: 'vastu_audit',
      title: '',
      content: ''
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center text-white">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="font-serif text-3xl font-bold">Access Unauthorized</h2>
        <p className="text-gray-400 mt-2">Only system administrators can access administrative panels.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-16 text-white pt-24 min-h-screen">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Settings className="text-amber-400 animate-spin-slow h-8 w-8" />
            VastuPro Administration Board
          </h2>
          <p className="text-xs text-gray-400 mt-1">Real-time SaaS billing metrics and user catalog overrides.</p>
        </div>
      </div>

      {/* Analytics Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card border border-gold-500/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Gross Revenue</p>
            <p className="text-2xl font-extrabold text-gold-400">₹{totalRevenue}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gold-400/5 border border-gold-400/20 flex items-center justify-center text-gold-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
        <div className="glass-card border border-gold-500/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Signed Users</p>
            <p className="text-2xl font-extrabold text-cyan-400">{usersList.length}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
        <div className="glass-card border border-gold-500/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Sales</p>
            <p className="text-2xl font-extrabold text-rose-300">{orders.length}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-450/5 border border-rose-500/20 flex items-center justify-center text-rose-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>
        <div className="glass-card border border-gold-500/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">AI Bulletins Out</p>
            <p className="text-2xl font-extrabold text-purple-400">{reports.length}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-400/5 border border-purple-400/20 flex items-center justify-center text-purple-400">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Admin tabs */}
      <div className="flex border-b border-white/5 gap-2 mb-8">
        {[
          { id: 'users', label: 'User Credits Overrides', icon: Users },
          { id: 'services', label: 'Pricing Configuration', icon: Settings },
          { id: 'orders', label: 'Cashfree Audit Logs', icon: ShoppingBag },
          { id: 'upload', label: 'Manual Reports Dispatcher', icon: FileUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg text-sm font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-gold-400 bg-gold-400/5 text-gold-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs panels */}
      <div className="glass-card border border-gold-500/10 rounded-2xl p-6 md:p-8">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-amber-100">Credit Overrides Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3">User Details</th>
                    <th className="pb-3">User ID Reference</th>
                    <th className="pb-3">Permission Level</th>
                    <th className="pb-3">Credits Balance</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map(u => (
                    <tr key={u.uid} className="hover:bg-white/1 select-none">
                      <td className="py-3">
                        <p className="font-semibold">{u.displayName || "Seeker Profile"}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-400">{u.uid}</td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={e => onUpdateUserRole(u.uid, e.target.value as any)}
                          className="px-2 py-1 bg-royal-950 border border-white/15 rounded text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 font-bold text-lg text-gold-400">
                        {u.credits}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => onUpdateUserCredits(u.uid, u.credits + 1)}
                            className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-royal-950 border border-green-500/20 text-xs font-bold rounded"
                          >
                            +1 Cr
                          </button>
                          <button
                            onClick={() => onUpdateUserCredits(u.uid, Math.max(0, u.credits - 1))}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-royal-950 border border-rose-500/20 text-xs font-bold rounded"
                          >
                            -1 Cr
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-amber-100">Dynamic Service Pricing Core</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(srv => (
                <div key={srv.serviceId} className="p-4 border border-white/5 bg-royal-900/40 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gold-300 border border-white/10 uppercase font-bold text-center">
                      {srv.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-white mt-1.5">{srv.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{srv.tagline}</p>
                  </div>

                  <div className="text-right">
                    {editingService === srv.serviceId ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={e => setTempPrice(parseInt(e.target.value) || 0)}
                          className="w-16 px-1 py-1 bg-royal-950 border border-gold-400/50 rounded text-center text-xs font-bold"
                        />
                        <button
                          onClick={() => handleSavePrice(srv.serviceId)}
                          className="p-1 bg-green-500 text-royal-950 rounded"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-extrabold text-gold-400">₹{srv.price}</p>
                        <button
                          onClick={() => {
                            setEditingService(srv.serviceId);
                            setTempPrice(srv.price);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-amber-100">Cashfree PG Transactions Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3">Order Code</th>
                    <th className="pb-3">Client Email</th>
                    <th className="pb-3">Service Code</th>
                    <th className="pb-3">Total paid</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(o => (
                    <tr key={o.orderId} className="hover:bg-white/1">
                      <td className="py-3 font-mono text-xs">{o.orderId}</td>
                      <td className="py-3">
                        <p className="font-semibold text-white">{o.customerName || "Ramesh Kumar"}</p>
                        <p className="text-xs text-gray-400">{o.customerEmail}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-300 font-mono">{o.serviceId}</td>
                      <td className="py-3 text-gold-400 font-extrabold">₹{o.amount}</td>
                      <td className="py-3 text-xs text-gray-400 font-mono">{o.createdAt.replace('T', ' ').substring(0, 16)}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          o.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-amber-400/10 text-amber-300'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-amber-100">Manual Reports Dispatch Altar</h3>
            <p className="text-gray-400 text-xs">Directly insert custom astrological, Kundli matching, or structural Vastu PDF/Markdown remedies reports to a user's safe vault.</p>

            <form onSubmit={handleManualUpload} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Target User ID</label>
                <select
                  required
                  value={reportForm.targetUserId}
                  onChange={e => setReportForm({...reportForm, targetUserId: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-950 font-semibold"
                >
                  <option value="">-- Choose Target Account Profile --</option>
                  {usersList.map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName || u.email} ({u.uid})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Service category</label>
                  <select
                    value={reportForm.serviceId}
                    onChange={e => setReportForm({...reportForm, serviceId: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-950"
                  >
                    {VA_SERVICES.map(s => <option key={s.serviceId} value={s.serviceId}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Report Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vastu Correction Map - Flat 301"
                    value={reportForm.title}
                    onChange={e => setReportForm({...reportForm, title: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-950 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Complete Report Prescriptions (Markdown)</label>
                <textarea
                  required
                  rows={8}
                  placeholder={`### 🌌 Comprehensive Astro Consultation Report \nYour planetary alignment is excellent...`}
                  value={reportForm.content}
                  onChange={e => setReportForm({...reportForm, content: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-950 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Dispatch Report to Seeker Vault</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
