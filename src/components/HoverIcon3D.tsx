
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HoverIcon3DProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  size?: number;
}

const HoverIcon3D = ({ icon: Icon, onClick, className = "", size = 24 }: HoverIcon3DProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 ${className}`}
      whileHover={{ 
        scale: 1.1, 
        rotateY: 15,
        rotateX: 15,
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        transformStyle: "preserve-3d"
      }}
      transition={{ duration: 0.2 }}
    >
      <Icon size={size} />
    </motion.button>
  );
};

export default HoverIcon3D;
