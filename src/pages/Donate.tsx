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
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (!donationAmount || !formData.firstName || !formData.lastName || !formData.email || !formData.cardHolderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate card number length (remove spaces)
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    // Validate expiry format
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      alert('Please enter expiry date in MM/YY format');
      return;
    }

    // Validate CVV
    if (formData.cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return;
    }

    setIsProcessing(true);

    // Simulate realistic payment processing
    setTimeout(() => {
      setShowPaymentModal(false);
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Auto-hide success banner after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setFormData({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          cardHolderName: '',
          cardNumber: '', 
          expiryDate: '', 
          cvv: '' 
        });
        setDonationAmount('');
        setCustomAmount('');
        setSelectedAmount(null);
      }, 5000);
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
                  <h3 className="font-semibold text-gray-700">Personal Information</h3>
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

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                      <path d="M2 10h20" strokeWidth="2"/>
                    </svg>
                    Card Details
                  </h3>
                  
                  {/* Card Holder Name */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardHolderName"
                      placeholder="JOHN DOE"
                      required
                      value={formData.cardHolderName}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData({ ...formData, cardHolderName: value });
                      }}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 uppercase"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                        setFormData({ ...formData, cardNumber: formatted });
                      }}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 font-mono tracking-wider"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
                        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                        <circle cx="18" cy="16" r="9" fill="#EB001B"/>
                        <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
                      </svg>
                      <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
                        <rect width="48" height="32" rx="4" fill="#0066B2"/>
                        <path d="M27 8L21 24M30 8L24 24M33 8L27 24" stroke="white" strokeWidth="2"/>
                      </svg>
                      <span className="text-xs text-gray-500">Test: 4242 4242 4242 4242</span>
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        value={formData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setFormData({ ...formData, expiryDate: value });
                        }}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        placeholder="123"
                        maxLength={3}
                        required
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, cvv: value });
                        }}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs text-gray-600">Your payment information is secure and encrypted</span>
                  </div>
                </div>

                {/* Submit Button */}
<button
  onClick={handlePaymentSubmit}
  disabled={!donationAmount || parseFloat(donationAmount) < 10 || !formData.firstName || !formData.lastName || !formData.email || !formData.cardHolderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv || isProcessing}
  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {isProcessing ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Processing Payment...
    </>
  ) : (
    <>
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

      {/* Success Banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 text-white">
                  <h3 className="font-bold text-lg">Payment Successful!</h3>
                  <p className="text-sm text-green-50">Thank you for your donation</p>
                </div>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-gradient-to-b from-green-50 to-white">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">R{donationAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donor:</span>
                    <span className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600 text-xs">
                      A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}