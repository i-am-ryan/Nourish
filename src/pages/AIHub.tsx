// src/pages/AIHub.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Camera, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoodQualityChecker from "@/components/ai/FoodQualityChecker";
import SmartChatbot from "@/components/ai/SmartChatbot";

const HERO_IMG = "/lovable-uploads/erhan-astam-yLcK3Itx6ok-unsplash.jpg";

export default function AIHub() {
  const [activeFeature, setActiveFeature] = useState<"none" | "quality" | "chat">("none");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [qualityCheckerOpen, setQualityCheckerOpen] = useState(false);

  return (
    <div className="pt-20">
      {/* Hero Section */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-blue-800/55 to-purple-900/35" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,transparent_30%,rgba(0,0,0,0.55))]" />

          <div className="absolute inset-x-0 bottom-0 translate-y-8">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow">
                  AI-Powered{" "}
                  <span className="bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text text-transparent">
                    Food Safety
                  </span>
                </h1>
                <p className="mt-3 text-lg text-purple-200">
                  Smart tools to help you assess food quality and get instant assistance.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI Features */}
      <div className="max-w-5xl mx-auto px-6 mt-20 mb-16">
        <AnimatePresence mode="wait">
          {activeFeature === "none" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Food Quality Checker */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative rounded-3xl overflow-hidden text-left group shadow-xl"
                onClick={() => setQualityCheckerOpen(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/80 to-blue-800/60" />

                <div className="relative p-8 h-64 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="text-2xl font-bold">Food Quality Checker</div>
                      <div className="text-white/85">
                        Take a photo to assess food safety and freshness
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>AI-powered visual assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Safety recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Shelf life estimates</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start text-sm rounded-full bg-white/15 px-3 py-1 group-hover:bg-white/25 transition">
                    Start checking <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              {/* Smart Chatbot */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative rounded-3xl overflow-hidden text-left group shadow-xl"
                onClick={() => setChatbotOpen(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/80 to-teal-800/60" />

                <div className="relative p-8 h-64 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="text-2xl font-bold">Smart Assistant</div>
                      <div className="text-white/85">
                        Get instant help with food safety and platform guidance
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span>Food safety guidance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span>Platform navigation help</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span>Volunteer task assistance</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start text-sm rounded-full bg-white/15 px-3 py-1 group-hover:bg-white/25 transition">
                    Start chatting <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className="text-center">
                <Button variant="ghost" onClick={() => setActiveFeature("none")}>
                  ← Back to AI Hub
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Components */}
      <FoodQualityChecker
        isOpen={qualityCheckerOpen}
        onClose={() => setQualityCheckerOpen(false)}
        onResult={(result) => {
          console.log('Food quality result:', result);
        }}
      />

      <SmartChatbot
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
      />

      {/* How AI Helps Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How AI Makes Food Rescue Safer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI tools help volunteers and donors make informed decisions about food safety,
              ensuring that rescued food is safe for consumption.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Assessment</h3>
              <p className="text-gray-600">
                Take photos of food items to get instant quality assessments based on visual indicators.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Guidance</h3>
              <p className="text-gray-600">
                Get personalized advice on food handling, storage, and safety best practices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Support</h3>
              <p className="text-gray-600">
                Access instant help while volunteering or managing donations in the field.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}