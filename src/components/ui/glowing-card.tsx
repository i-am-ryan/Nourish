
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const GlowingCard = ({ children, className = "", glowColor = "green" }: GlowingCardProps) => {
  const glowColorClass = {
    green: "shadow-green-500/25 hover:shadow-green-500/40",
    orange: "shadow-orange-500/25 hover:shadow-orange-500/40",
    blue: "shadow-blue-500/25 hover:shadow-blue-500/40"
  }[glowColor] || "shadow-green-500/25 hover:shadow-green-500/40";

  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "backdrop-blur-md bg-white/80 border border-white/50 rounded-2xl p-6",
        "shadow-xl hover:shadow-2xl transition-all duration-300",
        "backdrop-saturate-150 relative overflow-hidden",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
        "before:bg-gradient-to-r before:from-green-400/20 before:to-blue-400/20",
        "before:-z-10",
        glowColorClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlowingCard;
