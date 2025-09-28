// src/components/ai/AIHub.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SmartChatbot from './SmartChatbot';
import FoodQualityChecker from './FoodQualityChecker';

const AIHub: React.FC = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [qualityCheckerOpen, setQualityCheckerOpen] = useState(false);

  return (
    <>
      {/* Smart Chatbot */}
      <SmartChatbot 
        isOpen={chatbotOpen} 
        onToggle={() => setChatbotOpen(!chatbotOpen)} 
      />

      {/* Food Quality Checker */}
      <FoodQualityChecker
        isOpen={qualityCheckerOpen}
        onClose={() => setQualityCheckerOpen(false)}
        onResult={(result) => {
          console.log('Food quality result:', result);
          // You can handle the result here - maybe save to database or show in chatbot
        }}
      />

      {/* Additional AI Features Button (if chatbot is closed) */}
      {!chatbotOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-6 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setQualityCheckerOpen(true)}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300"
            title="AI Food Quality Checker"
          >
            📸
          </motion.button>
        </motion.div>
      )}
    </>
  );
};

export default AIHub;