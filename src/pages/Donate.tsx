// src/pages/Donate.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ArrowRight, CheckCircle2 } from "lucide-react";
import DonateSurplusForm from "@/components/surplus/DonateSurplusForm";
import { Button } from "@/components/ui/button";

const HERO_IMG = "/lovable-uploads/michael-ali-Glt7d_fofLQ-unsplash.jpg"; // high-res
const CARD_BG = "/lovable-uploads/c84c72dc-5e01-4b9e-a7c8-fcc3dbfcf5e6.png";

export default function Donate() {
  const [active, setActive] = useState<"none" | "donate">("none");

  return (
    <div className="pt-20">
      {/* ====== HERO ====== */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Image with hover scale/parallax feel */}
        <div className="relative h-[340px] md:h-[380px]">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url('${HERO_IMG}')` }}
            initial={{ scale: 1.05 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
          {/* Teal → black tint to keep white text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-800/55 to-emerald-900/35" />
          {/* Gentle vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,transparent_30%,rgba(0,0,0,0.55))]" />

          {/* Headline */}
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
                {/* Tagline in green as requested */}
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
              {/* LEFT: Donate card */}
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
                        We’ll match it with a nearby hub and recipient
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start text-sm rounded-full bg-white/15 px-3 py-1 group-hover:bg-white/25 transition">
                    Start donating <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              {/* RIGHT: How it works (with hover effects) */}
              <motion.div
                whileHover={{
                  y: -6,
                  scale: 1.01,
                  boxShadow: "0 20px 60px rgba(16,185,129,0.25)",
                }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="relative rounded-3xl border bg-white/80 backdrop-blur-xl p-0 shadow-lg overflow-hidden group"
              >
                {/* animated accent bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 w-24 group-hover:w-36 transition-[width] duration-300" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xl font-semibold">How it works</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Tell us what you have and where you are</li>
                    <li>
                      • Our surplus matcher pairs your food with a suitable organisation
                    </li>
                    <li>• A volunteer confirms pickup / drop-off</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                   
                  </p>
                </div>
              </motion.div>
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
      </div>
    </div>
  );
}
