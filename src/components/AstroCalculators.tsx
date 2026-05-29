/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, HeartHandshake, Compass, Hash, Calendar, 
  MapPin, Clock, User, ArrowRight, UserCheck, Play, 
  Settings, CheckCircle, AlertCircle, Smartphone
} from 'lucide-react';
import { 
  calculateKundli, calculateGunMilan, calculateVastu, 
  calculateNumerology, getDailyHoroscope, ZODIAC_SIGNS,
  calculateMobileNumerology
} from '../utils/calculators';
import { UserProfile, PurchaseOrder } from '../types';

interface AstroCalculatorsProps {
  user: UserProfile | null;
  credits: number;
  onLogin: () => void;
  onNavigateToPricing: () => void;
  onAIReportGenerated: (report: any) => void;
  onDecrementCredit: () => void;
  onRedirectToServices?: () => void;
}

export default function AstroCalculators({ 
  user, 
  credits, 
  onLogin, 
  onNavigateToPricing, 
  onAIReportGenerated,
  onDecrementCredit,
  onRedirectToServices
}: AstroCalculatorsProps) {
  const [activeCalc, setActiveCalc] = useState<'kundli' | 'matching' | 'vastu' | 'numerology' | 'daily' | 'mobile-numerology'>('kundli');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Kundli state
  const [kundliInputs, setKundliInputs] = useState({
    name: '',
    birthDate: '1998-05-15',
    birthTime: '14:30',
    birthPlace: 'Mumbai, India',
    gender: 'Male'
  });
  const [kundliResult, setKundliResult] = useState<any>(null);

  // 2. Matching state
  const [matchInputs, setMatchInputs] = useState({
    boyName: '',
    boyBirthDate: '1996-08-20',
    boyBirthTime: '08:15',
    boyBirthPlace: 'Delhi, India',
    girlName: '',
    girlBirthDate: '1998-04-12',
    girlBirthTime: '16:45',
    girlBirthPlace: 'Pune, India'
  });
  const [matchResult, setMatchResult] = useState<any>(null);

  // 3. Vastu state
  const [vastuInputs, setVastuInputs] = useState({
    propertyType: 'home' as 'home' | 'office' | 'shop',
    entranceDirection: 'NE',
    kitchenDirection: 'SE',
    masterBedDirection: 'SW',
    toiletsDirection: 'NW',
    poojaRoomDirection: 'NE',
    livingRoomDirection: 'E'
  });
  const [vastuResult, setVastuResult] = useState<any>(null);

  // 4. Numerology state
  const [numerologyInputs, setNumerologyInputs] = useState({
    fullName: '',
    birthDate: '1995-10-15'
  });
  const [numerologyResult, setNumerologyResult] = useState<any>(null);

  // 4b. Mobile Numerology state
  const [mobileNumerologyInputs, setMobileNumerologyInputs] = useState({
    mobileNumber: '',
    birthDate: '1998-05-15'
  });
  const [mobileNumerologyResult, setMobileNumerologyResult] = useState<any>(null);
  const [mobileDecision, setMobileDecision] = useState<'yes' | 'no' | null>(null);

  // 5. Daily Daily Outlook state
  const [selectedZodiac, setSelectedZodiac] = useState('Aries');
  const [dailyResult, setDailyResult] = useState<any>(null);

  // Quick Client local calculators
  const handleCalculateKundli = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateKundli(kundliInputs);
    setKundliResult(res);
  };

  const handleCalculateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchInputs.boyName || !matchInputs.girlName) {
      alert("Please provide names for both partners");
      return;
    }
    const res = calculateGunMilan(matchInputs);
    setMatchResult(res);
  };

  const handleCalculateVastu = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateVastu(vastuInputs);
    setVastuResult(res);
  };

  const handleCalculateNumerology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numerologyInputs.fullName) {
      alert("Please enter full name");
      return;
    }
    const res = calculateNumerology(numerologyInputs);
    setNumerologyResult(res);
  };

  const handleCalculateDaily = (sign: string) => {
    const res = getDailyHoroscope(sign);
    setDailyResult(res);
  };

  const handleCalculateMobileNumerology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumerologyInputs.mobileNumber) {
      alert("Please enter your mobile number");
      return;
    }
    const res = calculateMobileNumerology(mobileNumerologyInputs);
    setMobileNumerologyResult(res);
    setMobileDecision(null);
  };

  // Calling Server-Side Gemini endpoint
  const handleUpgradeToProAI = async (serviceId: string, clientInputs: any, baseAnalysis: any) => {
    if (!user) {
      onLogin(); // Prompt Sign-in
      return;
    }

    if (credits <= 0) {
      alert("Insufficient credits to generate full Premium AI Report. Please subscribe or purchase credits.");
      onNavigateToPricing();
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/vastu-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          inputs: clientInputs,
          baseAnalysis
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        // Create matching Firestore document simulation structure
        const targetReport = {
          reportId: 'REP_' + Math.round(Math.random() * 899999 + 100000),
          userId: user.uid,
          serviceId: serviceId,
          title: `Premium AI Cosmic Analysis: ${serviceId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
          content: resJson.content,
          inputs: clientInputs,
          isPremium: true,
          createdAt: new Date().toISOString()
        };

        // Complete callback to write to database under user credentials
        onAIReportGenerated(targetReport);
        onDecrementCredit();
      } else {
        setErrorMsg(resJson.error || 'Celestials are out of rhythm. Failed to generate report.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network issues. Gemini API is taking long to synchronize. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-24 text-white">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-extrabold sm:text-5xl">
          Enter Your Details to <span className="text-gold-gradient">Decrypt Your Horizon</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-sm md:text-base">
          Our computational Astro-Engine processes standard coordinates instantly. Premium tier users can trigger deep AI structural prescriptions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-white/5 pb-6">
        {[
          { id: 'kundli', label: 'Kundli Chart', icon: Sparkles },
          { id: 'matching', label: 'Horoscope Match', icon: HeartHandshake },
          { id: 'vastu', label: 'Home Vastu Audit', icon: Compass },
          { id: 'numerology', label: 'Numerology Loshu', icon: Hash },
          { id: 'mobile-numerology', label: 'Mobile Numerology', icon: Smartphone },
          { id: 'daily', label: 'Daily Outlook', icon: Calendar }
        ].map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeCalc === calc.id 
                ? 'bg-gold-gradient text-royal-950 shadow-md font-bold' 
                : 'glass-card text-gray-300 hover:text-white border border-white/5'
            }`}
          >
            <calc.icon className="h-4 w-4" />
            <span>{calc.label}</span>
          </button>
        ))}
      </div>

      {/* Calculator Body - Render based on tab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-5 glass-card border border-gold-500/10 rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeCalc === 'kundli' && (
              <motion.form 
                key="kundli"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onSubmit={handleCalculateKundli}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Sparkles className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Kundli Planetary Calculation</h3>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={kundliInputs.name}
                      onChange={e => setKundliInputs({...kundliInputs, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Birth Date</label>
                    <input
                      type="date"
                      required
                      value={kundliInputs.birthDate}
                      onChange={e => setKundliInputs({...kundliInputs, birthDate: e.target.value})}
                      className="w-full px-3 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Birth Time</label>
                    <input
                      type="time"
                      required
                      value={kundliInputs.birthTime}
                      onChange={e => setKundliInputs({...kundliInputs, birthTime: e.target.value})}
                      className="w-full px-3 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Birth Place / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={kundliInputs.birthPlace}
                      onChange={e => setKundliInputs({...kundliInputs, birthPlace: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={kundliInputs.gender === g}
                          onChange={() => setKundliInputs({...kundliInputs, gender: g})}
                          className="accent-gold-400"
                        />
                        <span className="text-sm font-medium">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition"
                >
                  Generate Free Chart
                </button>
              </motion.form>
            )}

            {activeCalc === 'matching' && (
              <motion.form 
                key="matching"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onSubmit={handleCalculateMatch}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <HeartHandshake className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Sacred Ashtakoot Gun Milan</h3>
                </div>

                {/* Partner 1 (Boy) */}
                <div className="space-y-3 border-l-2 border-cyan-500 pl-4 py-1">
                  <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Boy (Bridegroom) Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Bridegroom Full Name"
                      value={matchInputs.boyName}
                      onChange={e => setMatchInputs({...matchInputs, boyName: e.target.value})}
                      className="col-span-2 w-full px-3 py-2.5 rounded-lg border border-white/10 bg-royal-900/50 text-white text-sm focus:outline-none focus:border-gold-400"
                    />
                    <input
                      type="date"
                      value={matchInputs.boyBirthDate}
                      onChange={e => setMatchInputs({...matchInputs, boyBirthDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-royal-900/50 text-white text-xs"
                    />
                    <input
                      type="time"
                      value={matchInputs.boyBirthTime}
                      onChange={e => setMatchInputs({...matchInputs, boyBirthTime: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-royal-900/50 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Partner 2 (Girl) */}
                <div className="space-y-3 border-l-2 border-rose-500 pl-4 py-1">
                  <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wider">Girl (Bride) Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Bride Full Name"
                      value={matchInputs.girlName}
                      onChange={e => setMatchInputs({...matchInputs, girlName: e.target.value})}
                      className="col-span-2 w-full px-3 py-2.5 rounded-lg border border-white/10 bg-royal-900/50 text-white text-sm focus:outline-none focus:border-gold-400"
                    />
                    <input
                      type="date"
                      value={matchInputs.girlBirthDate}
                      onChange={e => setMatchInputs({...matchInputs, girlBirthDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-royal-900/50 text-white text-xs"
                    />
                    <input
                      type="time"
                      value={matchInputs.girlBirthTime}
                      onChange={e => setMatchInputs({...matchInputs, girlBirthTime: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-royal-900/50 text-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition"
                >
                  Verify Marriage Matching (36 Gunas)
                </button>
              </motion.form>
            )}

            {activeCalc === 'vastu' && (
              <motion.form 
                key="vastu"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onSubmit={handleCalculateVastu}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Compass className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Property Vastu Directions Audit</h3>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Location Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['home', 'office', 'shop'].map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setVastuInputs({...vastuInputs, propertyType: type as any})}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border capitalize ${
                          vastuInputs.propertyType === type
                            ? 'bg-gold-gradient text-royal-950 border-amber-300'
                            : 'bg-royal-900/40 text-gray-300 border-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-gray-400 mb-1">Entrance Gate Facing</label>
                    <select
                      value={vastuInputs.entranceDirection}
                      onChange={e => setVastuInputs({...vastuInputs, entranceDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Kitchen Position (Burner)</label>
                    <select
                      value={vastuInputs.kitchenDirection}
                      onChange={e => setVastuInputs({...vastuInputs, kitchenDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['SE', 'NW', 'N', 'NE', 'SW', 'E', 'S', 'W'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Master Bed Zone</label>
                    <select
                      value={vastuInputs.masterBedDirection}
                      onChange={e => setVastuInputs({...vastuInputs, masterBedDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['SW', 'S', 'W', 'E', 'N', 'NE', 'NW', 'SE'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Toilets / Bath Drainage</label>
                    <select
                      value={vastuInputs.toiletsDirection}
                      onChange={e => setVastuInputs({...vastuInputs, toiletsDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['NW', 'W', 'SW', 'NE', 'SE', 'S', 'E', 'N'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Pooja Temple Space</label>
                    <select
                      value={vastuInputs.poojaRoomDirection}
                      onChange={e => setVastuInputs({...vastuInputs, poojaRoomDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['NE', 'E', 'N', 'W', 'NW', 'SE', 'S', 'SW'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Living Lounge Area</label>
                    <select
                      value={vastuInputs.livingRoomDirection}
                      onChange={e => setVastuInputs({...vastuInputs, livingRoomDirection: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-white/10 bg-royal-900 text-white"
                    >
                      {['E', 'N', 'NE', 'NW', 'W', 'SE', 'S', 'SW'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition"
                >
                  Generate Directional Score Card
                </button>
              </motion.form>
            )}

            {activeCalc === 'numerology' && (
              <motion.form 
                key="numerology"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onSubmit={handleCalculateNumerology}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Hash className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Numerology &amp; Loshu Grid Matrix</h3>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Your Full Name (Chaldean Method)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter spelling used in signatures"
                      value={numerologyInputs.fullName}
                      onChange={e => setNumerologyInputs({...numerologyInputs, fullName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Birth Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      required
                      value={numerologyInputs.birthDate}
                      onChange={e => setNumerologyInputs({...numerologyInputs, birthDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition"
                >
                  Map Driver &amp; Destiny Numbers
                </button>
              </motion.form>
            )}

            {activeCalc === 'mobile-numerology' && (
              <motion.form 
                key="mobile-numerology"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onSubmit={handleCalculateMobileNumerology}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Smartphone className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Mobile Numerology Audit</h3>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Your Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      pattern="[0-9]{10,12}"
                      title="Enter 10 to 12 digit number"
                      value={mobileNumerologyInputs.mobileNumber}
                      onChange={e => setMobileNumerologyInputs({...mobileNumerologyInputs, mobileNumber: e.target.value.replace(/\D/g, '')})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Accepts 10-12 digits. Consecutive combinations are run against our rule configurations.</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Birth Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      required
                      value={mobileNumerologyInputs.birthDate}
                      onChange={e => setMobileNumerologyInputs({...mobileNumerologyInputs, birthDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-royal-900/50 text-white focus:outline-none focus:border-gold-400 transition"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Used to extract psychic/driver and destiny numbers.</p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gold-gradient text-royal-950 font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Audit Mobile vibrations
                </button>
              </motion.form>
            )}

            {activeCalc === 'daily' && (
              <motion.div 
                key="daily"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Calendar className="text-gold-400 h-5 w-5" />
                  <h3 className="font-serif font-bold text-xl text-amber-100">Daily Lunar Transit Check</h3>
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {ZODIAC_SIGNS.map(sign => (
                    <button
                      key={sign.name}
                      onClick={() => {
                        setSelectedZodiac(sign.name);
                        handleCalculateDaily(sign.name);
                      }}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all ${
                        selectedZodiac === sign.name 
                          ? 'bg-gold-gradient text-royal-950 border-amber-400 scale-103 shadow-md' 
                          : 'bg-royal-940/30 text-gray-300 border-white/5 hover:border-gold-500/30'
                      }`}
                    >
                      <span className="text-lg">{sign.symbol}</span>
                      <span className="text-[10px] font-bold mt-1 tracking-tight truncate w-full text-center">{sign.name}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 italic">Select your Moon/Zodiac sign to align daily energy trends.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results / AI Report Upgrade Panel */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {/* Conditional state: loading spinner for AI */}
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card border border-gold-400/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
              >
                <Compass className="h-16 w-16 text-gold-400 animate-spin-slow mb-6" />
                <h4 className="font-serif text-2xl font-bold tracking-tight text-white animate-pulse">Channels Aligning...</h4>
                <p className="text-sm text-gray-400 max-w-sm mt-3 leading-relaxed">
                  VastuPro Gemini AI is fetching planetary matrices, checking Ashtakoot boundaries, and generating your detailed corrective prescriptions.
                </p>
                <div className="mt-8 flex justify-center space-x-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result_panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[400px]"
              >
                {/* 1. KUNDLI RESULT VISUALIZER */}
                {activeCalc === 'kundli' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!kundliResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Sparkles className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Kundli Planetary coordinates not generated yet</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Fill out your birth markers on the left to compute Vedic coordinates.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Header metadata summary */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Lagna Chart Coordinates</span>
                            <h3 className="font-serif text-2xl font-bold text-white mt-1 capitalize">{kundliInputs.name || 'Seeker'}</h3>
                          </div>
                          <div className="flex gap-4">
                            <div className="px-3 py-1.5 rounded-lg bg-royal-900 border border-white/5 text-center">
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">Lagna / Ascendant</p>
                              <p className="text-sm font-bold text-amber-300">{kundliResult.lagna} {kundliResult.lagnaSymbol}</p>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-royal-900 border border-white/5 text-center">
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">Moon Sign (Rashi)</p>
                              <p className="text-sm font-bold text-amber-300">{kundliResult.rashi} {kundliResult.rashiSymbol}</p>
                            </div>
                          </div>
                        </div>

                        {/* Traditional Vedic Chart Matrix layout representation */}
                        <div>
                          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Bhav Lagna planetary placement grid (First House Ascendant {kundliResult.lagna})</p>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                            {/* Matrix Houses representation */}
                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 2</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 2) || 'Empty'}</span>
                            </div>
                            <div className="border border-gold-400/20 rounded-lg p-3 bg-royal-900/90 flex flex-col items-center justify-center h-20 shadow-md">
                              <span className="text-amber-400 text-[10px] uppercase font-bold">LAGNA (House 1)</span>
                              <span className="text-amber-300 text-base mt-0.5">{getPlanetsInHouse(kundliResult.houses, 1) || 'Lagn'}</span>
                            </div>
                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 12</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 12) || 'Empty'}</span>
                            </div>

                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 3</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 3) || 'Empty'}</span>
                            </div>
                            <div className="border border-white/5 rounded-lg p-3 bg-royal-950 flex flex-col items-center justify-center h-20 text-[10px] text-gray-500 uppercase tracking-widest font-sans font-medium">
                              Vedic Chart
                            </div>
                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 11</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 11) || 'Empty'}</span>
                            </div>

                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 4</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 4) || 'Empty'}</span>
                            </div>
                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 5</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 5) || 'Empty'}</span>
                            </div>
                            <div className="border border-white/10 rounded-lg p-3 bg-royal-900/60 flex flex-col items-center justify-center h-20">
                              <span className="text-gray-500 text-[10px] uppercase">House 6</span>
                              <span className="text-cyan-300 text-sm mt-1">{getPlanetsInHouse(kundliResult.houses, 6) || 'Empty'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vimshottari Mahadasha Info */}
                        <div className="border border-dashed border-white/10 rounded-xl p-4 bg-white/2">
                          <p className="text-xs uppercase tracking-widest text-gold-400 font-bold mb-3">Vimshottari Mahadasha Overview</p>
                          <div className="space-y-2">
                            {kundliResult.dashas.slice(0, 4).map((d: any) => (
                              <div key={d.planet} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-200">{d.planet} Mahadasha ({d.end - d.start} yrs)</span>
                                <span className="text-xs text-gray-400">{d.start} - {d.end}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  d.status === 'Active' ? 'bg-amber-400 text-royal-950 animate-pulse' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Upgrade CTA */}
                        {renderUpgradeCTA('kundli_analysis', kundliInputs, kundliResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. MATCHING RESULTS */}
                {activeCalc === 'matching' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!matchResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <HeartHandshake className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Match score card not computed yet</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Input boy and girl parameters to compute wedding compatibility score.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Summary Score Card */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Ashtakoot Guna Match Rating</span>
                            <h3 className="font-serif text-2xl font-bold mt-1 text-white">
                              {inputsBoyDisplay(matchInputs)}
                            </h3>
                          </div>
                          
                          {/* Radial Score Gauge */}
                          <div className="relative flex items-center justify-center p-2 rounded-full border border-gold-400/20 bg-royal-900 min-w-24 h-24 text-center">
                            <div>
                              <p className="text-2xl font-extrabold text-gold-400">{matchResult.score}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">out of 36</p>
                            </div>
                          </div>
                        </div>

                        {/* Manglik status indicator */}
                        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Manglik Dosha Assessment</p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <p className="text-gray-300">Boy: <span className="font-bold text-white">{matchResult.manglikReport.boy}</span></p>
                            <p className="text-gray-300">Girl: <span className="font-bold text-white">{matchResult.manglikReport.girl}</span></p>
                          </div>
                          <p className="text-xs text-gray-400 italic mt-1 font-medium">{matchResult.manglikReport.verdict}</p>
                        </div>

                        {/* Scorecard table items */}
                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5">
                          {matchResult.details.map((guna: any) => (
                            <div key={guna.name} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                              <div className="max-w-[70%]">
                                <p className="font-semibold text-white">{guna.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{guna.desc}</p>
                              </div>
                              <div className="text-right font-mono font-bold">
                                <span className="text-gold-400">{guna.scored}</span>
                                <span className="text-gray-500"> / {guna.max}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Upgrade Trigger */}
                        {renderUpgradeCTA('horoscope_matching', matchInputs, matchResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. VASTU RESULTS */}
                {activeCalc === 'vastu' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!vastuResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Compass className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Layout Vastu score not analyzed yet</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Specify directions for room items on the left to measure elemental flow.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Overall score gauge */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Property Harmony Rating</span>
                            <h3 className="font-serif text-2xl font-bold mt-1 text-white">Vastu Harmony Verdict</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">{vastuResult.verdict}</p>
                          </div>
                          
                          {/* Circle scorecard */}
                          <div className={`relative flex items-center justify-center rounded-full border border-gold-400/20 bg-royal-900 w-24 h-24 text-center ${
                            vastuResult.score >= 80 ? 'shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          }`}>
                            <div>
                              <p className={`text-3xl font-extrabold ${vastuResult.score >= 80 ? 'text-green-400' : 'text-amber-400'}`}>{vastuResult.score}%</p>
                              <p className="text-[10px] text-gray-400 uppercase font-mono mt-0.5">Rating</p>
                            </div>
                          </div>
                        </div>

                        {/* Detail layout review list */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { title: 'Entrance', val: vastuInputs.entranceDirection, ratingObj: vastuResult.ratings.entrance },
                            { title: 'Kitchen', val: vastuInputs.kitchenDirection, ratingObj: vastuResult.ratings.kitchen },
                            { title: 'Master Bed', val: vastuInputs.masterBedDirection, ratingObj: vastuResult.ratings.bedroom },
                            { title: 'Toilets', val: vastuInputs.toiletsDirection, ratingObj: vastuResult.ratings.toilets },
                            { title: 'Pooja Room', val: vastuInputs.poojaRoomDirection, ratingObj: vastuResult.ratings.pooja },
                            { title: 'Living Lounge', val: vastuInputs.livingRoomDirection, ratingObj: vastuResult.ratings.living }
                          ].map(item => (
                            <div key={item.title} className="border border-white/5 rounded-xl p-3 bg-royal-900/50 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase font-bold">{item.title}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gold-300 font-bold">{item.val}</span>
                              </div>
                              <p className="text-sm font-semibold">{item.ratingObj.status}</p>
                              <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{item.ratingObj.remedy}</p>
                            </div>
                          ))}
                        </div>

                        {/* Upgrade CTA */}
                        {renderUpgradeCTA('vastu_audit', vastuInputs, vastuResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. NUMEROLOGY ANALYSIS */}
                {activeCalc === 'numerology' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!numerologyResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Hash className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Loshu Grid calculation not analyzed</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Input name spelling and birth parameters to reveal your cosmic driver conductor planetary frequencies.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Header coordinates */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Chaldean &amp; Loshu Vibrations</span>
                            <h3 className="font-serif text-2xl font-bold mt-1 text-white">{numerologyInputs.fullName}</h3>
                          </div>
                          
                          {/* Driver conductor badges */}
                          <div className="flex gap-2">
                            <div className="px-3 py-1 bg-royal-900 rounded-lg text-center border border-white/5">
                              <span className="text-[9px] text-gray-400 uppercase block font-semibold">Driver</span>
                              <span className="text-sm font-extrabold text-amber-300">{numerologyResult.driver}</span>
                            </div>
                            <div className="px-3 py-1 bg-royal-900 rounded-lg text-center border border-white/5">
                              <span className="text-[9px] text-gray-400 uppercase block font-semibold">Conductor</span>
                              <span className="text-sm font-extrabold text-amber-300">{numerologyResult.conductor}</span>
                            </div>
                            <div className="px-3 py-1 bg-royal-900 rounded-lg text-center border border-white/5">
                              <span className="text-[9px] text-gray-400 uppercase block font-semibold">Name Tally</span>
                              <span className="text-sm font-extrabold text-amber-300">{numerologyResult.nameNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* Loshu Grid Layout */}
                        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto text-center font-mono font-bold text-lg bg-royal-950/40 p-4 rounded-xl border border-white/5">
                          {numerologyResult.loshuGrid.map((item: any) => (
                            <div 
                              key={item.num} 
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg border h-16 ${
                                item.count > 0 
                                  ? 'bg-amber-400 text-royal-950 border-amber-300 font-extrabold font-mono shadow-sm' 
                                  : 'bg-royal-900/40 text-gray-600 border-white/5'
                              }`}
                            >
                              <span>{item.count > 0 ? item.num : '-'}</span>
                              <span className={`text-[8px] mt-0.5 uppercase tracking-tighter ${
                                item.count > 0 ? 'text-royal-950/70 font-bold' : 'text-gray-500'
                              }`}>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Planets Summary */}
                        <div className="bg-royal-900/50 border border-white/5 p-4 rounded-xl text-xs space-y-2">
                          <p className="font-bold text-amber-100 uppercase tracking-widest text-[10px]">Driver Planet Alignments</p>
                          <p className="text-gray-300">Your core planet is **${numerologyResult.driverPlanet.planet}**. Key traits under management: *${numerologyResult.driverPlanet.traits}*.</p>
                          <p className="text-gray-300 font-medium">Lucky color vibration: <span className="text-gold-300 font-bold">{numerologyResult.driverPlanet.color}</span></p>
                          <div className="border-t border-white/5 pt-2 mt-2">
                            <p className="font-bold text-amber-100 uppercase tracking-widest text-[10px]">Loshu Destiny Guidance</p>
                            <p className="text-gray-400 italic font-medium mt-1">"{numerologyResult.advice}"</p>
                          </div>
                        </div>

                        {/* Upgrade pro */}
                        {renderUpgradeCTA('numerology_report', numerologyInputs, numerologyResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* 4b. MOBILE NUMEROLOGY RESULT VISUALIZER */}
                {activeCalc === 'mobile-numerology' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!mobileNumerologyResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Smartphone className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Mobile Vibrations Audit Not Run</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Input your mobile coordinates and date of birth to evaluate energy nodes.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Header Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Vedas Mobile Audit Grid</span>
                            <h3 className="font-serif text-2xl font-bold mt-1 text-white">+{mobileNumerologyInputs.mobileNumber}</h3>
                          </div>
                          
                          {/* Score visual circular element */}
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-2 border-amber-400/40 bg-royal-950/40">
                              <span className="text-xl font-black font-mono text-amber-300">{mobileNumerologyResult.score}</span>
                              <span className="absolute -bottom-2 text-[8px] uppercase tracking-wider bg-amber-500 text-royal-950 px-1 font-bold rounded">Score</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase">Total Compatibility</p>
                              <span className={`inline-block px-2.5 py-0.5 mt-1 rounded text-xs font-bold leading-normal ${
                                mobileNumerologyResult.isTotalCompatible === 'Lucky' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                mobileNumerologyResult.isTotalCompatible === 'Neutral' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                                mobileNumerologyResult.isTotalCompatible === 'Enemy' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                                mobileNumerologyResult.isTotalCompatible === 'Hard Core Enemy' ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-extrabold animate-pulse' :
                                'bg-gray-500/10 text-gray-300 border border-white/10'
                              }`}>
                                {mobileNumerologyResult.isTotalCompatible} Value
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Planetary Driver/Conductor parameters */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-royal-900 border border-white/5 text-center">
                            <span className="text-[9px] text-gray-400 uppercase font-semibold block">King (Driver)</span>
                            <span className="text-lg font-black text-amber-300">{mobileNumerologyResult.kingNumber}</span>
                            <span className="text-[8px] text-gray-500 block mt-0.5">Core Self</span>
                          </div>
                          <div className="p-3 rounded-xl bg-royal-900 border border-white/5 text-center">
                            <span className="text-[9px] text-gray-400 uppercase font-semibold block">Conductor (Destiny)</span>
                            <span className="text-lg font-black text-amber-300">{mobileNumerologyResult.conductorNumber}</span>
                            <span className="text-[8px] text-gray-500 block mt-0.5">Life Path</span>
                          </div>
                          <div className="p-3 rounded-xl bg-royal-900 border border-white/5 text-center">
                            <span className="text-[9px] text-gray-400 uppercase font-semibold block">Phone Total</span>
                            <span className="text-lg font-black text-amber-300">{mobileNumerologyResult.mobileTotal} <span className="text-xs font-normal text-gray-400">→</span> {mobileNumerologyResult.reducedMobileTotal}</span>
                            <span className="text-[8px] text-gray-500 block mt-0.5">Key Vibration</span>
                          </div>
                        </div>

                        {/* Verdict container */}
                        <div className="p-4 rounded-xl bg-gold-400/5 border border-gold-400/15 text-xs text-gray-300 leading-relaxed font-sans">
                          <span className="font-bold text-amber-200 block uppercase mb-1 tracking-wider text-[9px]">Vedic Compass Verdict</span>
                          {mobileNumerologyResult.verdict}
                        </div>

                        {/* Interactive "Bad Number" decider panel */}
                        {mobileNumerologyResult.isBadNumber && (
                          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-4 shadow-xl">
                            <div className="flex gap-3 items-start">
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                                <AlertCircle className="h-5 w-5 animate-pulse" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-serif font-bold text-lg text-rose-300">Your Number is Bad for You!</h4>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Your phone number carries highly conflicting planetary codes. It has more negative configurations ({mobileNumerologyResult.wrongCount}) than positive ones ({mobileNumerologyResult.rightCount}). This alignment acts as a heavy drain on your life, luck, and relationships.
                                </p>
                              </div>
                            </div>
                            
                            {mobileDecision === null ? (
                              <div className="space-y-3 pt-2">
                                <p className="text-xs font-bold text-amber-200 uppercase tracking-wider text-center">Do you want a better number? Do you want an easier life?</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMobileDecision('yes');
                                      onRedirectToServices?.();
                                    }}
                                    className="py-2.5 px-4 rounded-xl bg-gold-gradient text-royal-950 font-bold text-xs hover:opacity-95 active:scale-95 transition cursor-pointer text-center"
                                  >
                                    Yes, I want an easier life!
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMobileDecision('no')}
                                    className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-rose-300 border border-rose-500/20 text-xs font-semibold active:scale-95 transition cursor-pointer text-center"
                                  >
                                    No, keep my number
                                  </button>
                                </div>
                              </div>
                            ) : mobileDecision === 'yes' ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-3 font-sans"
                              >
                                <p className="text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                                  Vedas Divine Path Chosen!
                                </p>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  An excellent choice. Aligning your digital footprints brings harmony, professional abundance, and smooth pathways. You can request our premium AI to generate a detailed, comprehensive <strong className="text-amber-200">Mobile Correction report</strong> below, or select a new 10-digit number that sums to a lucky single digit like <strong className="text-amber-300 font-mono font-bold text-sm bg-emerald-900/40 px-1.5 py-0.5 rounded">{mobileNumerologyResult.kingNumber}</strong>.
                                </p>
                                <button 
                                  type="button"
                                  onClick={() => setMobileDecision(null)}
                                  className="text-[10px] text-amber-400/80 hover:text-amber-300 font-medium tracking-wide uppercase transition self-start cursor-pointer"
                                >
                                  ← Reset Selection
                                </button>
                              </motion.div>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-gray-900 border border-white/5 space-y-3 font-sans"
                              >
                                <p className="text-amber-400 text-xs font-bold">Vibration Warning Acknowledged</p>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  We understand. Living with conflicting vibrations can feel like constantly walking against the wind. If you feel ready to lift these blockages in the future, you can come back and explore options to transition to an easier, flow-friendly life path at any time.
                                </p>
                                <button 
                                  type="button"
                                  onClick={() => setMobileDecision(null)}
                                  className="text-[10px] text-gray-400 hover:text-white font-medium tracking-wide uppercase transition self-start cursor-pointer"
                                >
                                  ← Back to options
                                </button>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Combinations section */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Sequential Numeric Pairs Evaluation</h4>
                          
                          {/* Good Combos */}
                          {mobileNumerologyResult.goodCombosFound.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wide font-sans">Auspicious Rays (Good Combinations)</span>
                              <div className="grid gap-2">
                                {mobileNumerologyResult.goodCombosFound.map((item: any) => (
                                  <div key={item.combo} className="flex gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs items-start">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-mono font-bold text-emerald-300 mr-2 bg-emerald-950 px-1.5 py-0.5 rounded text-[11px]">{item.combo}</span>
                                      <span className="text-gray-300">{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Repeats Found */}
                          {mobileNumerologyResult.repeatsFound.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wide font-sans">Repeating Digits (Double / Triple effects)</span>
                              <div className="grid gap-2">
                                {mobileNumerologyResult.repeatsFound.map((item: any) => (
                                  <div key={item.combo} className="flex gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs items-start">
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-mono font-bold text-amber-300 mr-2 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">{item.combo}</span>
                                      <span className="text-gray-300">{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Neutral Combos */}
                          {mobileNumerologyResult.neutralCombosFound.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wide font-sans">Steady Rays (Neutral Combinations)</span>
                              <div className="grid gap-1.5">
                                {mobileNumerologyResult.neutralCombosFound.map((item: any) => (
                                  <div key={item.combo} className="flex gap-3 p-2.5 rounded-xl bg-sky-500/5 border border-sky-500/10 text-xs items-start">
                                    <Compass className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-mono font-bold text-sky-300 mr-2 bg-sky-950 px-1.5 py-0.5 rounded text-[11px]">{item.combo}</span>
                                      <span className="text-gray-400">{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Negative Combos */}
                          {mobileNumerologyResult.negativeCombosFound.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wide font-sans">Heavy Fields (Negative Combinations to manage)</span>
                              <div className="grid gap-2">
                                {mobileNumerologyResult.negativeCombosFound.map((item: any) => (
                                  <div key={item.combo} className="flex gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs items-start">
                                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-mono font-bold text-rose-350 mr-2 bg-rose-950 px-1.5 py-0.5 rounded text-[11px]">{item.combo}</span>
                                      <span className="text-gray-300">{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Avoided patterns warn */}
                          {mobileNumerologyResult.avoidedCombosFound.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs mt-2">
                              <span className="font-bold text-red-300 block uppercase mb-1 flex items-center gap-1.5 text-[9px] tracking-widest font-sans">
                                <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
                                Avoid List Mismatch Found
                              </span>
                              <p className="text-gray-400 leading-normal">
                                Your phone number directly features sequence paths listed under standard numerological avoid-lists: <span className="text-amber-200 font-mono font-bold">{mobileNumerologyResult.avoidedCombosFound.join(', ')}</span>.
                              </p>
                            </div>
                          )}

                          {/* Preferred Preferences check */}
                          {mobileNumerologyResult.totalPrefInfo && (
                            <div className="p-3.5 rounded-xl bg-royal-900 border border-amber-500/10 text-xs mt-2 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-amber-200 text-[10px] uppercase tracking-wider block font-sans">Total Vibration Goal Match</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${mobileNumerologyResult.totalPreferenceMatched ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gray-500/10 text-gray-400'}`}>
                                  {mobileNumerologyResult.totalPreferenceMatched ? 'Preference Perfect' : 'Standard Alignment'}
                                </span>
                              </div>
                              <p className="text-gray-400 leading-normal">
                                Reduced Total of <span className="font-serif font-semibold text-gold-300">{mobileNumerologyResult.reducedMobileTotal}</span> matches your target focus need: *{mobileNumerologyResult.totalPrefInfo.purpose}*.
                              </p>
                              {mobileNumerologyResult.totalPreferenceMatched ? (
                                <p className="text-emerald-300 font-medium">
                                  ✓ Excellent! Formed premium combination <span className="font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded">{mobileNumerologyResult.matchedPrefCombos.join(', ')}</span> detected directly inside your number sequences.
                                </p>
                              ) : (
                                <p className="text-gray-500">
                                  Tip: Incorporating preferred sequences like <span className="text-gray-400 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded">{mobileNumerologyResult.totalPrefInfo.prefCombos.join(', ')}</span> optimizes the energy of this total.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Upgrade pro */}
                        {renderUpgradeCTA('mobile_numerology', mobileNumerologyInputs, mobileNumerologyResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. DAILY HOROSCOPE RESULTS */}
                {activeCalc === 'daily' && (
                  <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
                    {!dailyResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Calendar className="h-12 w-12 text-gold-500/40 mb-3 animate-pulse" />
                        <h4 className="font-serif text-lg text-gray-400">Moon alignment prediction is empty</h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Select a Zodiac sign on the left to compute instant daily solar transitions.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Header sign */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Daily Stellar Alignment</span>
                            <h3 className="font-serif text-2xl font-bold text-white mt-1">{selectedZodiac} Daily Transit Outlook</h3>
                          </div>
                          
                          <div className="flex gap-4 font-mono font-bold text-xs">
                            <div className="px-3 py-1.5 rounded-lg bg-royal-900 border border-white/5">
                              <span className="text-[10px] text-gray-400 block">LUCKY COLOR</span>
                              <span className="text-amber-300">{dailyResult.luckyColor}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-royal-900 border border-white/5">
                              <span className="text-[10px] text-gray-400 block">LUCKY NUMBER</span>
                              <span className="text-amber-300 text-center block text-sm">{dailyResult.luckyNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic category metrics slider */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {[
                            { name: 'Career / Power', score: dailyResult.scores.career, color: 'bg-cyan-500' },
                            { name: 'Love / Connect', score: dailyResult.scores.love, color: 'bg-rose-500' },
                            { name: 'Health / Prana', score: dailyResult.scores.health, color: 'bg-green-500' },
                            { name: 'Wealth / Cashflow', score: dailyResult.scores.wealth, color: 'bg-amber-500' }
                          ].map(metric => (
                            <div key={metric.name} className="border border-white/5 p-3 rounded-lg bg-royal-900/50 space-y-2">
                              <div className="flex justify-between font-bold">
                                <span>{metric.name}</span>
                                <span className="font-mono text-gold-400">{metric.score}%</span>
                              </div>
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${metric.color}`} style={{ width: `${metric.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* General guidelines */}
                        <div className="bg-royal-900/30 p-4 rounded-xl border border-white/5 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Auspicious Transit Hours Today</p>
                          <p className="text-xs font-semibold text-white">{dailyResult.idealHours}</p>
                          <div className="border-t border-white/5 pt-2 mt-2">
                            <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Planetary Recommendation</p>
                            <p className="text-xs text-gray-300 leading-relaxed mt-1 font-medium">{dailyResult.guidance}</p>
                          </div>
                        </div>

                        {/* Upgrade CTA daily */}
                        {renderUpgradeCTA('daily_horoscope_upgrade', { zodiac: selectedZodiac }, dailyResult)}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );

  function getPlanetsInHouse(houses: Record<string, number>, target: number): string {
    const planets = Object.entries(houses)
      .filter(([planet, house]) => house === target)
      .map(([planet]) => planet.substring(0, 2)); // Short name like Su, Mo, Ma
    return planets.join(', ');
  }

  function inputsBoyDisplay(inputs: any): string {
    return `${inputs.boyName} & ${inputs.girlName}`;
  }

  // Render upgrade to premium trigger helper
  function renderUpgradeCTA(serviceId: string, clientInputs: any, baseAnalysis: any) {
    return (
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gold-400/5 border border-gold-400/20">
          <div>
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-widest inline-flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              Upgrade to Premium AI Analysis
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Harness Gemini's extensive Vedic planetary modeling to write a highly detailed 400-word remedial prescription.
            </p>
          </div>
          
          <button
            onClick={() => handleUpgradeToProAI(serviceId, clientInputs, baseAnalysis)}
            className="flex items-center gap-1 rounded bg-gold-gradient text-royal-950 px-4 py-2 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer"
          >
            <span>Generate Pro Report</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-950/20 px-3 py-1.5 rounded border border-red-500/10 mt-3 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        )}
      </div>
    );
  }
}
