// src/pages/Donate.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ArrowRight, CheckCircle2, DollarSign, X, Loader2 } from "lucide-react";
import DonateSurplusForm from "@/components/surplus/DonateSurplusForm";
import { Button } from "@/components/ui/button";

const HERO_IMG = "/lovable-uploads/michael-ali-Glt7d_fofLQ-unsplash.jpg";
const CARD_BG = "/lovable-uploads/c84c72dc-5e01-4b9e-a7c8-fcc3dbfcf5e6.png";
const MONEY_CARD_BG = "/lovable-uploads/bcdd34cf-b94b-43c0-b644-ce63b929d5c4.png";

export default function Donate() {
  const [active, setActive] = useState<"none" | "donate">("none");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [50, 100, 250, 500, 1000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setDonationAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
    setSelectedAmount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = () => {
    if (!donationAmount || !formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Simulate realistic payment processing
    setTimeout(() => {
      setShowPaymentModal(false);
      setIsProcessing(false);
      
      // Show success message
      alert(`✅ Thank you ${formData.firstName}!\n\nYour donation of R${donationAmount} has been processed successfully.\n\nA confirmation email will be sent to ${formData.email}.`);
      
      // Reset form
      setFormData({ firstName: '', lastName: '', email: '' });
      setDonationAmount('');
      setCustomAmount('');
      setSelectedAmount(null);
    }, 2000);
  };

  return (
    <div className="pt-20">
      {/* ====== HERO ====== */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative h-[340px] md:h-[380px]">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url('${HERO_IMG}')` }}
            initial={{ scale: 1.05 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-800/55 to-emerald-900/35" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,transparent_30%,rgba(0,0,0,0.55))]" />

          <div className="absolute inset-x-0 bottom-0 translate-y-8">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow">
                  Make A{" "}
                  <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                    Difference Today
                  </span>
                </h1>
                <p className="mt-3 text-lg text-emerald-200">
                  Smart matching connects your donation to a nearby hub today.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ====== CHOICES / FORM ====== */}
      <div className="max-w-5xl mx-auto px-6 mt-20 mb-16">
        <AnimatePresence mode="wait">
          {active === "none" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* LEFT: Donate Food Card */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative rounded-3xl overflow-hidden text-left group shadow-xl"
                onClick={() => setActive("donate")}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${CARD_BG}')` }}
                />
                <div className="absolute inset-0 bg-emerald-800/80 group-hover:bg-emerald-800/70 transition-colors" />
                <div className="absolute inset-0 backdrop-blur-[1px]" />

                <div className="relative p-8 h-64 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                      <Gift className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="text-2xl font-bold">Donate surplus food</div>
                      <div className="text-white/85">
                        We'll match it with a nearby hub and recipient
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start text-sm rounded-full bg-white/15 px-3 py-1 group-hover:bg-white/25 transition">
                    Start donating <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              {/* RIGHT: Donate Money Card */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative rounded-3xl overflow-hidden text-left group shadow-xl"
                onClick={() => setShowPaymentModal(true)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${MONEY_CARD_BG}')` }}
                />
                <div className="absolute inset-0 bg-teal-700/80 group-hover:bg-teal-700/70 transition-colors" />
                <div className="absolute inset-0 backdrop-blur-[1px]" />

                <div className="relative p-8 h-64 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="text-2xl font-bold">Donate money</div>
                      <div className="text-white/85">
                        Support our mission to fight food insecurity
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start text-sm rounded-full bg-white/15 px-3 py-1 group-hover:bg-white/25 transition">
                    Make a donation <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <DonateSurplusForm />
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setActive("none")}>
                  ← Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{
            y: -6,
            scale: 1.01,
            boxShadow: "0 20px 60px rgba(16,185,129,0.25)",
          }}
          className="relative rounded-3xl border bg-white/80 backdrop-blur-xl p-0 shadow-lg overflow-hidden group mt-8"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 w-24 group-hover:w-36 transition-[width] duration-300" />
          <div className="p-8">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-semibold">How it works</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li>• Tell us what you have and where you are</li>
              <li>• Our surplus matcher pairs your food with a suitable organisation</li>
              <li>• A volunteer confirms pickup / drop-off</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Make a Donation</h2>
                  <p className="text-sm text-teal-100 mt-1">Secure Payment Processing</p>
                </div>
                <button 
                  onClick={() => !isProcessing && setShowPaymentModal(false)}
                  disabled={isProcessing}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Amount Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Select Amount (ZAR)</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountSelect(amount)}
                        disabled={isProcessing}
                        className={`py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                          selectedAmount === amount
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        R{amount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={handleCustomAmount}
                      disabled={isProcessing}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                      min="10"
                    />
                  </div>
                  {donationAmount && parseFloat(donationAmount) < 10 && (
                    <p className="text-sm text-amber-600 mt-2">Minimum donation is R10</p>
                  )}
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Your Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!donationAmount || parseFloat(donationAmount) < 10 || !formData.firstName || !formData.lastName || !formData.email || isProcessing}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Donate R{donationAmount || '0'}
                    </>
                  )}
                </button>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                    🔒 Secure payment gateway integration
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    Demo mode for project demonstration
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}