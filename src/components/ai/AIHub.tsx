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

      {/* Camera button completely removed - no code here */}
    </>
  );
};

export default AIHub;