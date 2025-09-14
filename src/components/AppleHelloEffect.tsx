
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { text: "Hello", lang: "English" },
  { text: "Molo", lang: "Xhosa" },
  { text: "Sawubona", lang: "Zulu" },
  { text: "Dumelang", lang: "Sotho" },
  { text: "Avuxeni", lang: "Tsonga" },
  { text: "Thobela", lang: "Sepedi" },
  { text: "Lotjhani", lang: "Ndebele" },
  { text: "Sanibona", lang: "Swati" },
  { text: "Ndaa", lang: "Venda" },
  { text: "Goeiedag", lang: "Afrikaans" }
];

const AppleHelloEffect = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold text-green-600 mb-4"
        >
          {languages[currentIndex].text}
        </motion.div>
      </AnimatePresence>
      <motion.p 
        className="text-xl text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Welcome to NourishSA
      </motion.p>
    </div>
  );
};

export default AppleHelloEffect;
