
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import GlassCard from '@/components/GlassCard';
import { Star, Award, Flame, Trophy } from 'lucide-react';

interface ProgressTrackerProps {
  volunteerStats: {
    totalPoints: number;
    tasksCompleted: number;
    rank: string;
    level: number;
  };
}

const ProgressTracker = ({ volunteerStats }: ProgressTrackerProps) => {
  const levelProgress = ((volunteerStats.totalPoints % 100) / 100) * 100; // Assuming 100 points per level
  const weeklyStreak = 5; // Mock data
  const nextLevelPoints = Math.ceil(volunteerStats.totalPoints / 100) * 100;
  
  const badges = [
    { icon: Star, name: 'First Delivery', earned: true, color: 'text-yellow-500' },
    { icon: Award, name: '10 Tasks Hero', earned: true, color: 'text-purple-500' },
    { icon: Flame, name: 'Weekly Warrior', earned: true, color: 'text-orange-500' },
    { icon: Trophy, name: 'Monthly Champion', earned: false, color: 'text-gray-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Level {volunteerStats.level}</span>
            <span className="text-sm text-gray-600">Level {volunteerStats.level + 1}</span>
          </div>
          
          <Progress value={levelProgress} className="h-3" />
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{volunteerStats.totalPoints}</div>
            <div className="text-sm text-gray-600">
              {nextLevelPoints - volunteerStats.totalPoints} points to next level
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Community Rank */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Rank</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">#3</div>
          <div className="text-sm text-gray-600 mb-2">in your area</div>
          <Badge variant="secondary">{volunteerStats.rank}</Badge>
        </div>
      </GlassCard>

      {/* Weekly Streak */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Streak</h3>
        <div className="flex justify-center items-center space-x-2 mb-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-2xl font-bold text-orange-600">{weeklyStreak}</span>
          <span className="text-sm text-gray-600">days</span>
        </div>
        <div className="text-center text-sm text-gray-600">
          Keep it up! Complete a task today to continue your streak.
        </div>
      </GlassCard>

      {/* Badges */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              className={`p-3 rounded-lg border-2 text-center ${
                badge.earned 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <badge.icon className={`w-6 h-6 mx-auto mb-1 ${badge.color}`} />
              <div className="text-xs font-medium text-gray-700">{badge.name}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default ProgressTracker;