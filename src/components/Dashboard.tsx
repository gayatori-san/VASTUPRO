/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Calendar, CreditCard, Clock, FileText, 
  Coins, Star, Download, ChevronRight, Sparkles, Compass, AlertCircle
} from 'lucide-react';
import { UserProfile, PurchaseOrder, VastuReport } from '../types';

interface DashboardProps {
  user: UserProfile | null;
  orders: PurchaseOrder[];
  reports: VastuReport[];
  credits: number;
}

export default function Dashboard({ user, orders, reports, credits }: DashboardProps) {
  const [selectedReport, setSelectedReport] = useState<VastuReport | null>(null);

  // Simple clean markdown-to-HTML parser to display report output beautifully without extra packages
  const parseMarkdown = (markdown: string) => {
    if (!markdown) return '';
    return markdown
      .split('\n')
      .map((line, idx) => {
        const trimmed = line.trim();
        // Headings
        if (trimmed.startsWith('###')) {
          return `<h3 key=${idx} class="font-serif text-xl font-bold text-amber-200 mt-6 mb-3">${trimmed.replace('###', '')}</h3>`;
        }
        if (trimmed.startsWith('####')) {
          return `<h4 key=${idx} class="font-serif text-lg font-bold text-amber-100 mt-4 mb-2">${trimmed.replace('####', '')}</h4>`;
        }
        // Blockquotes
        if (trimmed.startsWith('>')) {
          return `<blockquote key=${idx} class="border-l-4 border-amber-500 pl-4 py-1 italic bg-gold-400/5 text-gray-300 my-4 rounded-r-lg">${trimmed.substring(1).trim()}</blockquote>`;
        }
        // Bold markup
        let parsedLine = trimmed;
        const boldRegex = /\*\*(.*?)\*\*/g;
        parsedLine = parsedLine.replace(boldRegex, '<strong class="text-amber-100">$1</strong>');
        // Unordered lists
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          return `<li key=${idx} class="list-disc list-inside text-gray-300 ml-4 mb-1.5">${parsedLine.substring(1).trim()}</li>`;
        }
        if (trimmed.match(/^\d+\./)) {
          return `<li key=${idx} class="list-decimal list-inside text-gray-300 ml-4 mb-1.5">${parsedLine.replace(/^\d+\./, '').trim()}</li>`;
        }
        // Blank line
        if (trimmed === '') {
          return '<div class="h-2"></div>';
        }
        // Normal paragraph
        return `<p key=${idx} class="text-gray-300 text-sm leading-relaxed mb-3">${parsedLine}</p>`;
      })
      .join('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-16 text-white pt-24 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Profile Statistics & Credits */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="glass-card border border-gold-500/10 rounded-2xl p-6">
            <p className="text-[10px] tracking-widest uppercase text-gold-400 font-bold mb-4">Astronomy Account</p>
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full border border-gold-400/40" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-royal-800 text-gold-300 border border-white/15 flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
              )}
              <div>
                <h3 className="font-serif text-lg font-bold text-white">{user?.displayName || "Mystic Seeker"}</h3>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gold-400/10 text-gold-300 border border-gold-400/20">
                  {user?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PREMIUM SEEKER'}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 mt-6 pt-5 grid grid-cols-2 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-royal-900 border border-white/5 space-y-1">
                <div className="flex justify-center text-amber-400">
                  <Coins className="h-5 w-5 animate-spin-slow" />
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Credits</p>
                <p className="text-xl font-extrabold text-white">{credits}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-royal-900 border border-white/5 space-y-1">
                <div className="flex justify-center text-amber-400">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Reports</p>
                <p className="text-xl font-extrabold text-white">{reports.length}</p>
              </div>
            </div>
          </div>

          {/* Checkout Transactions Billing History */}
          <div className="glass-card border border-gold-500/10 rounded-2xl p-6">
            <p className="text-[10px] tracking-widest uppercase text-gold-400 font-bold mb-4">Invoice Transactions ({orders.length})</p>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No purchase transactions logged yet.</p>
            ) : (
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {orders.map(order => (
                  <div key={order.orderId} className="p-3 rounded-xl border border-white/5 bg-royal-940/30 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white truncate max-w-[150px]">{order.serviceName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        order.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-mono text-[10px]">
                      <span>₹{order.amount} paid</span>
                      <span>{order.createdAt.substring(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Reports Viewer and list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card border border-gold-400/15 rounded-2xl p-6 md:p-8 min-h-[500px]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Your Premium Astro prescriptions</h2>
                <p className="text-xs text-gray-400 mt-1">Select a compiled report to view detailed cosmic balances.</p>
              </div>
            </div>

            {selectedReport ? (
              // Selected Report Visualizer Block
              <div className="space-y-6 animate-spiritual-float-once">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition"
                >
                  &larr; Back to Reports List
                </button>

                {/* Report Metadata */}
                <div className="border border-gold-400/20 bg-gold-400/2 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-gold-400 opacity-20">
                    <Compass className="h-16 w-16 animate-spin-slow" />
                  </div>
                  <span className="text-[10px] text-gold-300 font-bold uppercase tracking-widest">Completed Consultation Report</span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">{selectedReport.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400 font-mono">
                    <p>Report ID: {selectedReport.reportId}</p>
                    <p>Created: {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Body Parsing Content */}
                <div 
                  className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedReport.content) }}
                />

                <div className="border-t border-white/10 pt-6 flex items-center justify-between text-xs text-gray-500">
                  <span>Digitally sealed &amp; signed under the authority of VastuPro India.</span>
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([selectedReport.content], { type: 'text/markdown' });
                      element.href = URL.createObjectURL(file);
                      element.download = `${selectedReport.title}.md`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="flex items-center gap-1 border border-gold-400/25 bg-gold-400/5 hover:bg-gold-gradient hover:text-royal-950 px-3.5 py-2 rounded text-xs font-bold text-amber-200 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            ) : (
              // Empty reports list state
              <div>
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
                    <Star className="h-12 w-12 text-gold-400/30 animate-pulse" />
                    <h3 className="font-serif text-lg text-gray-400">Your Cosmos Altar is blank</h3>
                    <p className="text-xs text-gray-500 max-w-sm">You haven't generated any premium reports yet. Try one of our calculators and click "Generate Pro Report" to trigger professional calculations.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((rep) => (
                      <div
                        key={rep.reportId}
                        onClick={() => setSelectedReport(rep)}
                        className="p-5 rounded-xl border border-white/10 bg-royal-900/60 hover:border-gold-400/40 hover:bg-royal-900 cursor-pointer transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[8px] font-bold uppercase tracking-wider">
                              Vedic Prescription
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">{rep.createdAt.substring(0, 10)}</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-white mt-3 leading-snug line-clamp-2">
                            {rep.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                            {rep.content.replace(/[#*>_`-]/g, '').slice(0, 150)}...
                          </p>
                        </div>

                        <div className="border-t border-white/5 mt-5 pt-3 flex items-center justify-between text-xs text-amber-300 font-semibold group">
                          <span>View Full Report</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
