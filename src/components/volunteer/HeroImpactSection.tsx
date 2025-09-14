// src/components/volunteer/HeroImpactSection.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, 
  Clock, 
  Award, 
  Heart, 
  TrendingUp, 
  Users, 
  MapPin, 
  Sparkles, 
  Target,
  Globe,
  Zap,
  Shield,
  Crown,
  Star,
  Activity,
  Leaf,
  HandHeart,
  ChevronRight,
  BarChart3,
  Calendar,
  Trophy
} from "lucide-react";
import * as V from "@/lib/volunteer";

interface UserStats {
  totalTasks: number;
  tasksThisWeek: number;
  totalHours: number;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
  rank?: string;
  impactPoints: number;
}

interface HeroImpactSectionProps {
  userStats?: UserStats;
}

type ImpactState = { 
  mealsDelivered: number; 
  hours: number; 
  surplusKg: number;
  volunteersActive: number;
  communitiesServed: number;
  co2Saved: number;
};

// Define stat item interface with optional icon2 property
interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  gradient: string;
  bgGradient: string;
  description: string;
  change: string;
  icon2?: React.ComponentType<{ className?: string }>;
}

const HeroImpactSection: React.FC<HeroImpactSectionProps> = ({ userStats }) => {
  const [impact, setImpact] = useState<ImpactState>({
    mealsDelivered: 0,
    hours: 0,
    surplusKg: 0,
    volunteersActive: 0,
    communitiesServed: 0,
    co2Saved: 0,
  });

  const [animatedValues, setAnimatedValues] = useState<ImpactState>({
    mealsDelivered: 0,
    hours: 0,
    surplusKg: 0,
    volunteersActive: 0,
    communitiesServed: 0,
    co2Saved: 0,
  });

  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await V.getGlobalImpact();
        if (data) {
          const newImpact = {
            mealsDelivered: (data as any).mealsDelivered ?? (data as any).meals_delivered ?? 47250,
            hours: (data as any).hours ?? 125800,
            surplusKg: (data as any).surplusKg ?? (data as any).surplus_kg ?? 28500,
            volunteersActive: (data as any).volunteersActive ?? 12500,
            communitiesServed: (data as any).communitiesServed ?? 45,
            co2Saved: (data as any).co2Saved ?? 15200,
          };
          setImpact(newImpact);

          // Enhanced animation with staggered effect
          const duration = 2500;
          const steps = 80;
          const stepTime = duration / steps;

          let currentStep = 0;
          const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const easeOut = 1 - Math.pow(1 - progress, 2.5); // Smoother easing

            setAnimatedValues({
              mealsDelivered: Math.round(newImpact.mealsDelivered * easeOut),
              hours: Math.round(newImpact.hours * easeOut),
              surplusKg: Math.round(newImpact.surplusKg * easeOut),
              volunteersActive: Math.round(newImpact.volunteersActive * easeOut),
              communitiesServed: Math.round(newImpact.communitiesServed * easeOut),
              co2Saved: Math.round(newImpact.co2Saved * easeOut),
            });

            if (currentStep >= steps) {
              clearInterval(interval);
            }
          }, stepTime);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to load impact data:", error);
        // Set fallback values
        const fallbackImpact = {
          mealsDelivered: 47250,
          hours: 125800,
          surplusKg: 28500,
          volunteersActive: 12500,
          communitiesServed: 45,
          co2Saved: 15200,
        };
        setImpact(fallbackImpact);
        setAnimatedValues(fallbackImpact);
      }
    })();
  }, []);

  const globalImpactStats: StatItem[] = [
    { 
      icon: Utensils, 
      value: animatedValues.mealsDelivered.toLocaleString(), 
      label: "Meals Delivered", 
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      description: "Nutritious meals reaching families",
      change: "+2,500 this month",
      icon2: Heart
    },
    { 
      icon: Leaf, 
      value: `${animatedValues.surplusKg.toLocaleString()}kg`, 
      label: "Food Rescued", 
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      description: "Surplus food saved from waste",
      change: "+850kg this week",
      icon2: Shield
    },
    { 
      icon: Clock, 
      value: animatedValues.hours.toLocaleString(), 
      label: "Volunteer Hours", 
      gradient: "from-orange-500 via-red-500 to-pink-500",
      bgGradient: "from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20",
      description: "Hours of dedicated service",
      change: "+1,200h this month",
      icon2: Activity
    },
    { 
      icon: Users, 
      value: animatedValues.volunteersActive.toLocaleString(), 
      label: "Active Heroes", 
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      description: "Amazing community volunteers",
      change: "+340 new this month",
      icon2: Crown
    },
  ];

  const personalStats: StatItem[] = userStats ? [
    {
      icon: Target,
      value: userStats.totalTasks.toString(),
      label: "Tasks Completed",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      description: "Your volunteer missions",
      change: `+${userStats.tasksThisWeek} this week`
    },
    {
      icon: Clock,
      value: userStats.totalHours.toString(),
      label: "Impact Hours",
      gradient: "from-teal-500 to-cyan-600",
      bgGradient: "from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
      description: "Hours changing lives",
      change: "Making a difference"
    },
    {
      icon: Zap,
      value: userStats.streak.toString(),
      label: "Day Streak",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      description: "Consecutive impact days",
      change: "Keep it going!"
    },
    {
      icon: Trophy,
      value: userStats.level.toString(),
      label: "Current Level",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      description: userStats.rank || "Growing stronger",
      change: `${userStats.xp} XP earned`
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Background Image with Enhanced Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop"
            alt="Community impact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/85 to-cyan-900/75" />
          
          {/* Animated Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
        
        <div className="relative px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center text-white max-w-5xl mx-auto"
          >
            {/* Icon with animated glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative inline-flex items-center justify-center w-20 h-20 mb-8"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl animate-pulse"></div>
              <TrendingUp className="w-10 h-10 relative z-10" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Impact Dashboard
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Changing Lives Daily
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Track your personal impact and celebrate the collective power of our volunteer community 
              transforming South African communities every single day.
            </motion.p>
            
            {/* Enhanced Live Impact Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30"
            >
              <div className="relative mr-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold mr-2">Live Impact Tracking</span>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">98.5%</div>
                <div className="opacity-80">Success Rate</div>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">{animatedValues.communitiesServed}+</div>
                <div className="opacity-80">Communities Served</div>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{Math.round(animatedValues.co2Saved / 1000)}T</div>
                <div className="opacity-80">CO₂ Saved</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Floating Achievement Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8" />
            <div className="text-sm">
              <div className="font-bold">Top Impact Hub</div>
              <div className="opacity-80">South Africa 2024</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8" />
            <div className="text-sm">
              <div className="font-bold">Global Recognition</div>
              <div className="opacity-80">UN SDG Partner</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tab Selector */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 dark:border-gray-700/30">
            {[
              { id: "global", label: "Global Impact", icon: Globe },
              { id: "personal", label: "Your Impact", icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Stats Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {(activeTab === "global" ? globalImpactStats : personalStats).map((stat, index) => (
            <motion.div
              key={`${activeTab}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-3xl p-6 shadow-lg border border-white/50 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white rounded-full"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-full"></div>
                </div>
                
                {/* Content */}
                <div className="relative">
                  {/* Icon with secondary icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    {stat.icon2 && (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <stat.icon2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-end space-x-2">
                      <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse mb-1" />
                    </div>
                    
                    <div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {stat.description}
                      </div>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 2, ease: "easeOut" }}
                        className={`h-1.5 bg-gradient-to-r ${stat.gradient} rounded-full shadow-sm`}
                      />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Community Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Environmental Impact */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-6 border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200/30 rounded-full"></div>
          <div className="relative flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-green-800 dark:text-green-200 mb-1">
                Environmental Champion
              </div>
              <div className="text-sm text-green-600 dark:text-green-300 mb-2">
                Preventing {animatedValues.co2Saved.toLocaleString()}kg CO₂ emissions through food rescue
              </div>
              <div className="flex items-center text-xs text-green-700 dark:text-green-300">
                <Shield className="w-3 h-3 mr-1" />
                Equivalent to planting {Math.round(animatedValues.co2Saved / 22)} trees
              </div>
            </div>
          </div>
        </div>

        {/* Community Reach */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 rounded-3xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/30 rounded-full"></div>
          <div className="relative flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-1">
                Nationwide Impact
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                Active in {animatedValues.communitiesServed}+ communities across South Africa
              </div>
              <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
                <Activity className="w-3 h-3 mr-1" />
                From Cape Town to Johannesburg, Durban to Pretoria
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      {!userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-700/50"
        >
          <HandHeart className="w-16 h-16 mx-auto mb-6 text-emerald-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Make Your Impact?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of volunteers creating real change in South African communities. 
            Every task completed, every meal delivered makes a difference.
          </p>
          <button className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
            <Target className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Start Your Volunteer Journey
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default HeroImpactSection;