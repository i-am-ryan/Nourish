
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { Utensils, Clock, Award, Heart } from 'lucide-react';

interface HeroImpactSectionProps {
  volunteerStats: {
    totalPoints: number;
    tasksCompleted: number;
    rank: string;
    level: number;
  };
}

const HeroImpactSection = ({ volunteerStats }: HeroImpactSectionProps) => {
  const impactStats = [
    { icon: Utensils, value: '1,247', label: 'Meals Delivered', color: 'text-green-600' },
    { icon: Heart, value: '89kg', label: 'Surplus Rescued', color: 'text-purple-600' },
    { icon: Clock, value: '156', label: 'Volunteer Hours', color: 'text-orange-600' },
    { icon: Award, value: volunteerStats.rank, label: 'Current Rank', color: 'text-blue-600' }
  ];

  return (
    <div className="relative h-96 overflow-hidden rounded-3xl mb-12">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-green-800/80" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center px-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Actions Feed Families.<br />
          <span className="text-yellow-300">Your Time Changes Lives.</span>
        </motion.h1>
        
        {/* Impact Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {impactStats.map((stat, index) => (
            <GlassCard key={index} className="text-center bg-white/20 backdrop-blur-md border-white/30">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/90">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button 
            size="lg" 
            className="bg-white text-green-600 hover:bg-white/90 font-semibold px-8 py-4 text-lg"
          >
            View My Impact Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroImpactSection;