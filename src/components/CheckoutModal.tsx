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
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full border border-gold-500/20 bg-gold-400/5 flex items-center justify-center mb-3">
                  <Coins className="h-6 w-6 text-gold-400 animate-spin-slow" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Cashfree Payment Gateway</h3>
                <p className="text-xs text-gray-400 mt-1">Securing cosmic alignment checkout session</p>
              </div>

              {/* Order Info */}
              <div className="bg-royal-900 border border-white/5 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-semibold text-white">{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-mono text-xs text-gray-300">{orderId}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-gold-400 text-base">
                  <span>Total Amount:</span>
                  <span>₹{amount}.00</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 text-xs">
                <p className="text-gray-400 uppercase tracking-wider font-bold mb-1">Select Payment Instrument</p>
                {[
                  'UPI (Google Pay / PhonePe / Paytm)',
                  'Debit/Credit Card (Visa, MasterCard, RuPay)',
                  'Netbanking (State Bank, HDFC, ICICI)',
                  'LazyPay / PayLater Wallet'
                ].map((method) => (
                  <label
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedMethod === method
                        ? 'border-gold-400 bg-gold-400/5 text-gold-300 font-bold'
                        : 'border-white/5 bg-white/2 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={selectedMethod === method}
                      readOnly
                      className="accent-gold-400"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-3 text-sm font-semibold border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerPayment}
                  className="flex-1 bg-gold-gradient text-royal-950 rounded-lg py-3 text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition"
                >
                  Pay ₹{amount}.00
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                <span>PCI-DSS Compilant 128-Bit SSL SECURE</span>
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
                <CreditCard className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold">Processing Transaction...</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Communicating with Cashfree secure channels. Verifying funds and initiating celestial order confirmations.
                </p>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Do not refresh your tab or close this overlay...</p>
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
                <h4 className="font-serif text-2xl font-bold text-green-400">Payment Succeeded!</h4>
                <p className="text-xs text-gray-400 mt-2">Transaction completed. Order verified on VastuPro ledger.</p>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-xl p-3.5 text-xs text-gray-300 font-mono max-w-xs mx-auto">
                <p>Instrument: {selectedMethod.split(" ")[0]}</p>
                <p className="mt-1">Order Tally: {orderId}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
