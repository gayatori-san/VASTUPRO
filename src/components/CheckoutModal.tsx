/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, Coins, CheckCircle, Clock } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  serviceName: string;
  onPaymentSuccess: (transactionDetails: { transactionId: string; method: string }) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  orderId,
  amount,
  serviceName,
  onPaymentSuccess
}: CheckoutModalProps) {
  const [step, setStep] = useState<'options' | 'processing' | 'success'>('options');
  const [selectedMethod, setSelectedMethod] = useState('UPI (Google Pay / PhonePe)');

  const triggerPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onPaymentSuccess({
          transactionId: "TX_SIM_" + Math.floor(100000 + Math.random() * 900000),
          method: selectedMethod
        });
        setStep('options');
        onClose();
      }, 2000);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-card border border-gold-400/25 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full border border-gold-500/20 bg-gold-400/5 flex items-center justify-center mb-2">
                  <Coins className="h-6 w-6 text-gold-400 animate-spin-slow" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">NPCI Bharat UPI Payment Gateway</h3>
                <p className="text-[11px] text-gray-400 mt-1">Secured by VastuPro Merchant Server &amp; HDFC Merchant Bank</p>
              </div>

              {/* Order Info */}
              <div className="bg-royal-900 border border-white/5 p-4 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Consultation Plan:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Celestial Order ID:</span>
                  <span className="font-mono text-[10px] text-gray-300">{orderId}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-gold-400 text-sm">
                  <span>Payable Amount:</span>
                  <span>₹{amount}.00</span>
                </div>
              </div>

              {/* UPI Option Interactive Interface */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('UPI_QR')}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                      selectedMethod === 'UPI_QR'
                        ? 'border-gold-400 bg-gold-400/5 text-gold-300 font-bold'
                        : 'border-white/5 bg-white/2 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs">Scan UPI QR Code</span>
                    <span className="text-[9px] text-gray-500 block font-normal">Superfast on Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('UPI_ID')}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                      selectedMethod === 'UPI_ID'
                        ? 'border-gold-400 bg-gold-400/5 text-gold-300 font-bold'
                        : 'border-white/5 bg-white/2 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs">Enter UPI VPA / ID</span>
                    <span className="text-[9px] text-gray-500 block font-normal">GPay, PhonePe, Bhim</span>
                  </button>
                </div>

                {selectedMethod === 'UPI_QR' ? (
                  <div className="p-3.5 bg-royal-950/40 rounded-xl border border-white/5 space-y-3 flex flex-col items-center text-center">
                    <p className="text-[10px] text-gray-400 leading-tight">
                      Scan the BHIM UPI Unified QR Code with GPay, Paytm, PhonePe, or any banking app to complete payment.
                    </p>
                    
                    {/* Simulated vector QR design */}
                    <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                      <div className="w-36 h-36 border border-gray-200 relative flex items-center justify-center bg-gray-50">
                        {/* Custom QR Corner Anchors */}
                        <div className="absolute top-1.5 left-1.5 w-6 h-6 border-4 border-royal-950 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-royal-950" />
                        </div>
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 border-4 border-royal-950 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-royal-950" />
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-4 border-royal-950 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-royal-950" />
                        </div>
                        
                        {/* Decorative QR Data Bits Grid */}
                        <div className="grid grid-cols-6 gap-1 w-24 h-24 opacity-80">
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-300 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-400 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-300 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-400 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-200 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-300 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-200 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-450 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-400 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-300 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                          <div className="bg-gray-400 h-2 w-2 rounded-sm" />
                          <div className="bg-royal-950 h-2 w-2 rounded-sm" />
                        </div>
                        {/* Center logo icon */}
                        <div className="absolute bg-white p-1 rounded border border-gray-100 flex items-center justify-center">
                          <span className="text-[9px] font-extrabold text-royal-950 font-sans tracking-tighter">UPI</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 w-full">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">UPI VPA Merchant Code</p>
                      <p className="text-xs text-amber-300 underline font-mono select-all">thebatraanumerology@okhdfcbank</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-royal-950/40 rounded-xl border border-white/5 space-y-3.5">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1.5">Your UPI VPA ID</label>
                      <input
                        type="text"
                        placeholder="e.g. name@okhdfcbank, success@ybl"
                        className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-royal-900/50 text-xs text-white focus:outline-none focus:border-gold-400 transition"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2 border-t border-white/5 pt-2">
                      <span className="text-[10px] text-gray-500 font-sans">Accepts phonepe, gpay, paytm handles</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/10 uppercase font-bold">Safe VPA</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-xs font-semibold border border-white/10 transition cursor-pointer"
                >
                  Cancel Payment
                </button>
                <button
                  type="button"
                  onClick={triggerPayment}
                  className="flex-1 bg-gold-gradient text-royal-950 rounded-xl py-3 text-xs font-extrabold shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Confirm Paying ₹{amount}.00
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-500 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                <span>NPCI SECURE TRANSACTIONS SSL ENCRYPTED</span>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 space-y-6"
            >
              <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 animate-spin" />
                <Clock className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold">Verifying NPCI Ledger...</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Checking matching VPA transaction record for ₹{amount}.00 in HDFC merchant portal. This usually takes under 5 seconds.
                </p>
              </div>
              <p className="text-[9px] text-gray-500 font-mono">Simulating secure banking handshake...</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold text-green-400">UPI Payment Verified!</h4>
                <p className="text-xs text-gray-400 mt-1">Transaction logged. Credits updated on standard VastuPro profile.</p>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-[10px] text-gray-300 font-mono max-w-xs mx-auto">
                <p>Instrument: UPI (Scan Code/VPA)</p>
                <p className="mt-1">Transaction Ref: TX_UPI_{orderId.split('_').pop()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
