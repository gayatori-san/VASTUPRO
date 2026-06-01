/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldCheck, Star } from 'lucide-react';

interface HeroProps {
  onScrollToServices: () => void;
  onExploreFree: () => void;
}

export default function Hero({ onScrollToServices, onExploreFree }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-royal-950 pt-20 px-4">
      {/* 1. Animated Mandala Cosmic Background Indicator */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="relative w-[320px] h-[320px] md:w-[680px] md:h-[680px] rounded-full border border-gold-300/30 animate-spin-slow">
          {/* Concentric rings to make a beautiful Vedic astrolabe/compass structure */}
          <div className="absolute inset-4 rounded-full border border-dashed border-gold-400/20" />
          <div className="absolute inset-16 rounded-full border border-gold-500/15" />
          <div className="absolute inset-32 rounded-full border border-dashed border-gold-300/10" />
          {/* Direction markers */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-gold-400 text-xs font-mono">NORTH</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gold-400 text-xs font-mono">SOUTH</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gold-400 text-xs font-mono">WEST</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gold-400 text-xs font-mono">EAST</div>
          {/* Inner geometry */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="h-24 w-24 md:h-48 md:w-48 text-gold-400/30" />
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/10 h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
      <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
      <div className="absolute bottom-1/5 left-1/3 h-1 w-1 rounded-full bg-white opacity-40 animate-ping" />
      <div className="absolute top-2/3 right-1/8 h-1 w-1 rounded-full bg-amber-300 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Spiritual Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-royal-900/80 px-4 py-1.5 text-xs font-medium text-amber-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold-400 animate-spin-slow" />
          <span>Vedic Wisdom &amp; Precision Tech Re-imagined</span>
        </motion.div>

        {/* Display Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl md:text-7xl"
        >
          Unlock Ancient Wisdom with <br />
          <span className="text-gold-gradient">Modern Technology</span>
        </motion.h1>

        {/* Dynamic Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-base text-gray-300 md:text-lg leading-relaxed"
        >
          Align your living spaces, analyze cosmic planetary charts, and secure personalized remedies with VastuPro. Harnessing the ancient frameworks of Vedic Astrology and Vastu Shastra tailored for modern India.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-wrap justify-center gap-4 py-2"
        >
          <button
            onClick={onScrollToServices}
            className="rounded-lg bg-gold-gradient px-8 py-4 text-base font-bold text-royal-950 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Explore Services
          </button>
          <button
            onClick={onExploreFree}
            className="glass-card rounded-lg border border-gold-500/20 px-8 py-4 text-base font-bold text-amber-100 hover:bg-gold-500/5 hover:border-gold-400 active:scale-95 transition-all"
          >
            Try Free Calculators
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.65 }}
          className="mt-16 grid grid-cols-2 gap-y-4 gap-x-8 border-t border-white/5 pt-12 md:grid-cols-4"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-display text-gold-300">98.4%</span>
            <span className="text-xs text-gray-400 mt-1">Accuracy Rating</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-display text-gold-300">12,500+</span>
            <span className="text-xs text-gray-400 mt-1">Consultants Audited</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-display text-gold-300">Instant</span>
            <span className="text-xs text-gray-400 mt-1">Vedic Calculations</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-display text-gold-300">100% Secure</span>
            <span className="text-xs text-gray-400 mt-1">Privacy Retained</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
