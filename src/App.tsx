/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, HeartHandshake, Compass, Hash, Building2, 
  ChevronRight, Check, ShieldCheck, CreditCard, Lock, Users, Star, ArrowRight, Coins 
} from 'lucide-react';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AstroCalculators from './components/AstroCalculators';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import CheckoutModal from './components/CheckoutModal';

import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile, PurchaseOrder, ServiceItem, VastuReport, VA_SERVICES } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Real-time custom simulation data loaded from local storage for robust persistence
  const [credits, setCredits] = useState<number>(3); // Standard 3 default credits for nice starts
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [reports, setReports] = useState<VastuReport[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(VA_SERVICES);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Checkout overlay state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<{
    orderId: string;
    amount: number;
    serviceName: string;
    serviceId: string;
  } | null>(null);

  // Authenticate & Bind real-time observer
  useEffect(() => {
    // Standard Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Is admin email designated in bootstrap?
        const isAdmin = authUser.email === "g8805664808@gmail.com";
        const emailDisplayName = authUser.displayName || authUser.email?.split('@')[0] || "Seeker";

        const profile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email || "",
          displayName: emailDisplayName,
          photoURL: authUser.photoURL || undefined,
          role: isAdmin ? 'admin' : 'user',
          credits: credits,
          createdAt: new Date().toISOString()
        };
        setUser(profile);
        
        // Add auth user to our admin users tracking database if absent
        setUsersList(prev => {
          if (prev.some(u => u.uid === authUser.uid)) return prev;
          return [...prev, profile];
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [credits]);

  // Loading existing simulator data
  useEffect(() => {
    const cachedOrders = localStorage.getItem('vastupro_orders');
    const cachedReports = localStorage.getItem('vastupro_reports');
    const cachedCredits = localStorage.getItem('vastupro_credits');
    const cachedServices = localStorage.getItem('vastupro_services');

    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    if (cachedReports) setReports(JSON.parse(cachedReports));
    if (cachedCredits) setCredits(parseInt(cachedCredits));
    if (cachedServices) setServices(JSON.parse(cachedServices));

    // Bootstrapped Mock Users for high-fidelity interactive Admin panel
    const bootstrappedUsers: UserProfile[] = [
      {
        uid: 'USR_98231',
        email: 'ramesh.vaidya@gmail.com',
        displayName: 'Ramesh Kumawat',
        role: 'user',
        credits: 1,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        uid: 'USR_77123',
        email: 'priya.sharma@outlook.com',
        displayName: 'Priya Sharma',
        role: 'user',
        credits: 4,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      },
      {
        uid: 'USR_11902',
        email: 'g8805664808@gmail.com',
        displayName: 'Aditya Raj Vastu',
        role: 'admin',
        credits: 22,
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      }
    ];
    setUsersList(bootstrappedUsers);
  }, []);

  // Sync state modifications onto local storage caches
  const persistOrders = (newOrders: PurchaseOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('vastupro_orders', JSON.stringify(newOrders));
  };

  const persistReports = (newReports: VastuReport[]) => {
    setReports(newReports);
    localStorage.setItem('vastupro_reports', JSON.stringify(newReports));
  };

  const persistCredits = (newCr: number) => {
    setCredits(newCr);
    localStorage.setItem('vastupro_credits', newCr.toString());
    if (user) {
      setUser({ ...user, credits: newCr });
      setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, credits: newCr } : u));
    }
  };

  // UI Event Handlers
  const handleInitiatePurchase = (service: ServiceItem) => {
    if (!user) {
      alert("Please sign in using Google to buy reports");
      return;
    }

    const newOrderId = 'ORD_CF_' + Math.floor(100000 + Math.random() * 900000);
    setCheckoutTarget({
      orderId: newOrderId,
      amount: service.price,
      serviceName: service.name,
      serviceId: service.serviceId
    });
    setCheckoutOpen(true);
  };

  const handleCheckoutCompleted = (txnDetails: { transactionId: string; method: string }) => {
    if (!checkoutTarget || !user) return;

    // Calculate premium credits rewards:
    // Every plan award credits based on price
    // ₹199 -> +1 credit, ₹349 -> +2 credits, ₹499 -> +3 credits, ₹699 -> +5 credits, ₹899 -> +7 credits
    let creditsReward = 1;
    if (checkoutTarget.amount >= 800) creditsReward = 7;
    else if (checkoutTarget.amount >= 600) creditsReward = 5;
    else if (checkoutTarget.amount >= 400) creditsReward = 3;
    else if (checkoutTarget.amount >= 300) creditsReward = 2;

    const newOrder: PurchaseOrder = {
      orderId: checkoutTarget.orderId,
      userId: user.uid,
      serviceId: checkoutTarget.serviceId,
      serviceName: checkoutTarget.serviceName,
      amount: checkoutTarget.amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      customerEmail: user.email,
      customerName: user.displayName || user.email,
      inputs: {}
    };

    const updatedOrders = [newOrder, ...orders];
    persistOrders(updatedOrders);
    
    const newCreditsTotal = credits + creditsReward;
    persistCredits(newCreditsTotal);

    alert(`Payment successful! Transacted ${creditsReward} Premium consultation Credits to your profile.`);
    setActiveTab('dashboard');
  };

  const handleBuyCreditsPlan = (creditsCount: number, priceValue: number) => {
    if (!user) {
      alert("Please login with Google first.");
      return;
    }
    const orderId = 'ORD_CF_CR_' + Math.floor(100000 + Math.random() * 900000);
    setCheckoutTarget({
      orderId,
      amount: priceValue,
      serviceName: `Astro Credit Bundle (${creditsCount} Credits)`,
      serviceId: 'credits_pack'
    });
    setCheckoutOpen(true);
  };

  const handleCreateAIReport = (newReport: VastuReport) => {
    const updatedReports = [newReport, ...reports];
    persistReports(updatedReports);
    alert("Cosmic evaluation saved successfully onto your Secure Dashboard!");
    setActiveTab('dashboard');
  };

  // Administrative handlers
  const handleUpdateUserCredits = (uid: string, newCr: number) => {
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, credits: newCr } : u));
    if (user && user.uid === uid) {
      persistCredits(newCr);
    }
  };

  const handleUpdateUserRole = (uid: string, newRole: 'user' | 'admin') => {
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    if (user && user.uid === uid) {
      setUser({ ...user, role: newRole });
    }
  };

  const handleUpdateServicePrice = (serviceId: string, newPrice: number) => {
    const updatedSrv = services.map(s => s.serviceId === serviceId ? { ...s, price: newPrice } : s);
    setServices(updatedSrv);
    localStorage.setItem('vastupro_services', JSON.stringify(updatedSrv));
  };

  const handleAdminManualReportUpload = (manualReport: VastuReport) => {
    const updated = [manualReport, ...reports];
    persistReports(updated);
  };

  // Dynamic Icon selector helper
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="h-6 w-6 text-gold-400" />;
      case 'HeartHandshake': return <HeartHandshake className="h-6 w-6 text-gold-400" />;
      case 'Compass': return <Compass className="h-6 w-6 text-gold-400 animate-spiritual-float" />;
      case 'Hash': return <Hash className="h-6 w-6 text-gold-400" />;
      case 'Building2': return <Building2 className="h-6 w-6 text-gold-400" />;
      default: return <Compass className="h-6 w-6 text-gold-400" />;
    }
  };

  // Quick action user test triggers:
  const triggerSelfAdmin = () => {
    if (!user) {
      alert("Please login first to elevate permissions.");
      return;
    }
    const profile: UserProfile = { ...user, role: 'admin' };
    setUser(profile);
    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, role: 'admin' } : u));
    alert("Success! Elevated user to System Administrator. You can now access the Admin Tab!");
  };

  return (
    <div className="relative min-h-screen bg-royal-950 font-sans selection:bg-gold-500 selection:text-royal-950 overflow-x-hidden">
      {/* Golden top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient z-50" />

      {/* Embedded Test Assistant Helper Banner */}
      <div className="bg-amber-400/10 border-b border-amber-400/15 py-1.5 px-4 text-center text-xs text-amber-200 z-50 relative mt-1 select-none flex flex-wrap justify-center items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
        <span>Review Assistant: </span>
        <button 
          onClick={triggerSelfAdmin}
          className="underline font-bold text-amber-300 hover:text-white transition cursor-pointer"
        >
          Click to instantly unlock Administrator Role
        </button>
        <span className="text-gray-500">|</span>
        <span className="font-medium text-gray-400">Default Sandbox credit pool: <strong className="text-white">{credits} Cr</strong></span>
      </div>

      {/* Main Navbar */}
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <AnimatePresence mode="wait">
        {activeTab === 'landing' && (
          <motion.div
            key="landing_view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero */}
            <Hero 
              onScrollToServices={() => {
                const element = document.getElementById('services-grid');
                element?.scrollIntoView({ behavior: 'smooth' });
              }} 
              onExploreFree={() => setActiveTab('services')}
            />

            {/* Services Display Cards Section */}
            <section id="services-grid" className="mx-auto max-w-7xl px-4 py-20 text-white scroll-mt-16">
              <div className="text-center mb-16">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Consulting Suite</span>
                <h2 className="font-serif text-3xl font-extrabold sm:text-5xl mt-2">
                  Divine Astrological <span className="text-gold-gradient">&amp; Vastu Services</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-sm md:text-base">
                  Align your professional layout elements with modern non-destructive remedies, or dissect natal chart dashas instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((srv) => (
                  <div
                    key={srv.serviceId}
                    className="group glass-card border border-white/5 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="p-3 bg-white/2 rounded-xl w-fit border border-white/5 transition-transform group-hover:scale-105">
                        {getServiceIcon(srv.iconName)}
                      </div>
                      <h3 className="font-serif text-xl font-bold mt-4 text-white group-hover:text-gold-300 transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 italic font-semibold">{srv.tagline}</p>
                      <p className="text-sm text-gray-300 mt-3 leading-relaxed">{srv.description}</p>
                      
                      <div className="mt-5 space-y-2">
                        {srv.features.map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 mt-6 pt-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Standard Price</p>
                        <p className="text-xl font-extrabold text-gold-400">
                          {srv.price === 0 ? 'FREE' : `₹${srv.price}`}
                        </p>
                      </div>

                      {srv.price === 0 ? (
                        <button
                          onClick={() => setActiveTab('services')}
                          className="rounded bg-white/5 border border-white/10 text-white hover:bg-gold-gradient hover:text-royal-950 px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Calculator</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInitiatePurchase(srv)}
                          className="rounded bg-gold-gradient text-royal-950 px-5 py-2.5 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Buy Credits (1-7)</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonials or Vastu Mandala info card */}
            <section className="bg-royal-900/40 border-y border-white/5 py-20 px-4 text-white">
              <div className="mx-auto max-w-3xl text-center space-y-6">
                <div className="flex justify-center text-amber-400">
                  <Star className="h-7 w-7 text-gold-400 fill-gold-400" />
                  <Star className="h-7 w-7 text-gold-400 fill-gold-500" />
                  <Star className="h-7 w-7 text-gold-400 fill-gold-500" />
                  <Star className="h-7 w-7 text-gold-400 fill-gold-500" />
                  <Star className="h-7 w-7 text-gold-400 fill-gold-400" />
                </div>
                <blockquote className="font-serif text-xl md:text-2xl leading-relaxed text-gray-200">
                  "VastuPro's AI analysis for my office structural corrections boosted our team prana flow. We got clear crystal remedy prescriptions within seconds by using our standard layout coordinates."
                </blockquote>
                <div>
                  <p className="font-bold text-gold-300">Harish Singhania</p>
                  <p className="text-xs text-gray-500">Managing Director, Singhania Logistics, Gurgaon</p>
                </div>
              </div>
            </section>

            {/* Extra FAQ section */}
            <section className="mx-auto max-w-5xl px-4 py-20 text-white">
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Help center</span>
                <h2 className="font-serif text-2xl font-extrabold sm:text-4xl mt-1">Frequently Unlocked Frequencies</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-5 rounded-xl border border-white/5 bg-royal-900/20 space-y-2">
                  <h4 className="font-serif font-bold text-amber-200 text-base">Does Vastu require office demolition?</h4>
                  <p className="text-gray-400 leading-relaxed">No. VastuPro works purely with directional corrective crystals, metal threads, pyramid frequencies, and color filters. There is absolutely no structural damage advised.</p>
                </div>
                <div className="p-5 rounded-xl border border-white/5 bg-royal-900/20 space-y-2">
                  <h4 className="font-serif font-bold text-amber-200 text-base">How do I purchase AI credits?</h4>
                  <p className="text-gray-400 leading-relaxed">Simply sign in with Google, choose any premium service service click "Buy Credits", or subscribe to our bundle plans. Credit tokens sync to your profile instantly.</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            key="calculators_view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <div className="pt-20">
              <AstroCalculators 
                user={user}
                credits={credits}
                onLogin={() => alert("Please login using our Sign In action.")}
                onNavigateToPricing={() => setActiveTab('pricing')}
                onAIReportGenerated={handleCreateAIReport}
                onDecrementCredit={() => persistCredits(Math.max(0, credits - 1))}
                onRedirectToServices={() => {
                  setActiveTab('landing');
                  setTimeout(() => {
                    const element = document.getElementById('services-grid');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div
            key="pricing_view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="pt-24 min-h-screen pb-16 text-white"
          >
            <div className="text-center max-w-2xl mx-auto px-4 mb-16">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">SaaS Pricing Plans</span>
              <h2 className="font-serif text-3xl font-extrabold sm:text-5xl mt-2">Scale Your Cosmic Balance</h2>
              <p className="text-gray-400 text-xs mt-3">Select a plan to buy premium credits tokens. These are permanently saved on your profile and never expire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              {/* Plan 1 */}
              <div className="p-6 rounded-2xl border border-white/5 glass-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 font-bold uppercase">Basic Star</span>
                  <h3 className="font-serif text-2xl font-bold">1 Astro Credit</h3>
                  <p className="text-xs text-gray-400">Perfect to test a single detailed Room Vastu correction or birth chart dasha.</p>
                  <p className="text-3xl font-extrabold text-gold-400">₹199<span className="text-xs text-gray-500 font-normal"> / one-time</span></p>
                  <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> 1 Full markdown AI Report</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Basic gemstones recommendation</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyCreditsPlan(1, 199)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Buy 1 Credit Bundle
                </button>
              </div>

              {/* Plan 2 */}
              <div className="p-6 rounded-2xl border border-gold-400/30 glass-card space-y-4 scale-103 shadow-lg relative flex flex-col justify-between">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient text-royal-950 text-[10px] font-extrabold px-3.5 py-1 uppercase shadow-md">
                  Most Popular
                </span>
                <div className="space-y-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gold-400/10 border border-gold-400/20 text-gold-300 font-bold uppercase">Cosmic Guru</span>
                  <h3 className="font-serif text-2xl font-bold">5 Astro Credits</h3>
                  <p className="text-xs text-gray-400">Full house optimization plus planetary matching assessment. Generous discount included!</p>
                  <p className="text-3xl font-extrabold text-gold-400">₹499<span className="text-xs text-gray-500 font-normal"> / bundle</span></p>
                  <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> 5 Full markdown AI Reports</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Direct download as Markdown / PDF</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Priority server routing (fast generation)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyCreditsPlan(5, 499)}
                  className="w-full bg-gold-gradient text-royal-950 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                >
                  Buy 5 Credits Bundle
                </button>
              </div>

              {/* Plan 3 */}
              <div className="p-6 rounded-2xl border border-white/5 glass-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 font-bold uppercase">Archpriest Pass</span>
                  <h3 className="font-serif text-2xl font-bold">12 Astro Credits</h3>
                  <p className="text-xs text-gray-400">Ideal for professional architects, builders, or commercial astrolabes consulting teams.</p>
                  <p className="text-3xl font-extrabold text-gold-400">₹899<span className="text-xs text-gray-500 font-normal"> / bundle</span></p>
                  <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> 12 Full AI evaluation outputs</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Office &amp; commercial layout coverage</p>
                    <p className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Personalized signature vibration correctors</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyCreditsPlan(12, 899)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Buy 12 Credits Bundle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard_view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Dashboard 
              user={user}
              orders={orders}
              reports={reports}
              credits={credits}
            />
          </motion.div>
        )}

        {activeTab === 'admin' && (
          <motion.div
            key="admin_view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AdminPanel 
              user={user}
              usersList={usersList}
              orders={orders}
              reports={reports}
              services={services}
              onUpdateUserCredits={handleUpdateUserCredits}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateServicePrice={handleUpdateServicePrice}
              onUploadManualReport={handleAdminManualReportUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/5 bg-royal-950 py-12 text-center text-xs text-gray-500 space-y-4">
        <p className="font-serif font-bold text-gold-400 hover:text-white transition">VastuPro © 2026-PRESENT | Ancient Wisdom. Modern Living.</p>
        <p className="max-w-md mx-auto text-[11px] leading-relaxed px-4">Disclaimer: Astro-analytical reports generated by VastuPro are for planetary directional alignment reference. We encourage combining modern layout advice alongside traditional spiritual assessments.</p>
        <div className="flex justify-center gap-4 text-gray-400">
          <a href="#" className="hover:text-gold-300">Privacy Policy</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-gold-300">Terms of Use</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-gold-300">Refund Terms</a>
        </div>
      </footer>

      {/* Cashfree checkout simulator Modal */}
      {checkoutOpen && checkoutTarget && (
        <CheckoutModal 
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setCheckoutTarget(null);
          }}
          orderId={checkoutTarget.orderId}
          amount={checkoutTarget.amount}
          serviceName={checkoutTarget.serviceName}
          onPaymentSuccess={handleCheckoutCompleted}
        />
      )}
    </div>
  );
}
