import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimedWelcomeMessageProps {
  userName: string;
  duration?: number; // in milliseconds
  message?: string;
  className?: string;
}

export const TimedWelcomeMessage: React.FC<TimedWelcomeMessageProps> = ({
  userName,
  duration = 7000, // 7 seconds default
  message = "Welcome back",
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm bg-white/10 border border-white/20 shadow-2xl">
            <div className="text-2xl md:text-3xl font-semibold text-white drop-shadow-lg mb-2">
              {message}, {userName}! 👋
            </div>
            <p className="text-lg md:text-xl text-green-300 drop-shadow-md mb-4">
              Ready to make a difference today?
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">🌱 Join the community</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">🤝 Help others</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 