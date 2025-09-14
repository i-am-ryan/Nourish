
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import GlowingCard from './glowing-card';

interface ImpactCardProps {
  icon: LucideIcon;
  number: string;
  label: string;
  delay?: number;
}

const ImpactCard = ({ icon: Icon, number, label, delay = 0 }: ImpactCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
    >
      <GlowingCard className="text-center h-full">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white"
        >
          <Icon size={24} />
        </motion.div>
        <motion.div 
          className="text-3xl md:text-4xl font-bold text-green-600 mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          viewport={{ once: true }}
        >
          {number}
        </motion.div>
        <div className="text-gray-600 font-medium">{label}</div>
      </GlowingCard>
    </motion.div>
  );
};

export default ImpactCard;
