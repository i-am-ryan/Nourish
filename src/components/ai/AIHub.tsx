import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, MessageCircle } from 'lucide-react'; // Added Scan and MessageCircle icons
import SmartChatbot from './SmartChatbot';
import FoodScanner from './FoodScanner'; // Import the FoodScanner modal

const AIHub: React.FC = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false); // New state for Food Scanner

  // Function to handle opening/closing the Chatbot and ensuring only one is open
  const handleChatbotToggle = () => {
    if (scannerOpen) setScannerOpen(false); // Close scanner if open
    setChatbotOpen(!chatbotOpen);
  };
  
  // Function to handle opening/closing the Scanner and ensuring only one is open
  const handleScannerToggle = () => {
    if (chatbotOpen) setChatbotOpen(false); // Close chatbot if open
    setScannerOpen(!scannerOpen);
  };

  return (
    <>
      {/* AI Food Scanner Modal */}
      <FoodScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      {/* Smart Chatbot Modal */}
      <SmartChatbot
        isOpen={chatbotOpen}
        // We use our local handler to control state and close the scanner if necessary
        onToggle={handleChatbotToggle} 
      />

      {/* Floating Buttons Container: positions buttons in the bottom right corner, stacked vertically */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        
        {/* 1. AI Food Scanner Button (Above the Chatbot) */}
        <motion.button
          onClick={handleScannerToggle}
          // Exact same size (w-14 h-14) and purple/blue colour
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out
                     bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          aria-label="Open AI Food Scanner"
        >
          <Scan className="w-6 h-6" />
        </motion.button>
        
        {/* 2. Smart Chatbot Button (Below the Scanner) */}
        <motion.button
          onClick={handleChatbotToggle}
          // Assuming a distinct colour (e.g., green) and the same size (w-14 h-14)
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out
                     bg-green-500 text-white hover:shadow-xl hover:scale-105" 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          aria-label="Open Smart Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </div>
    </>
  );
};

export default AIHub;