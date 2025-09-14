import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Crown, 
  Target, 
  TrendingUp, 
  Users, 
  Clock,
  Award,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Medal,
  Zap,
  Flame, // Changed from Fire to Flame (Fire doesn't exist in lucide-react)
  Heart,
  Activity,
  Gift
} from "lucide-react";
import * as V from "@/lib/volunteer";

interface UserStats {
  totalTasks?: number;
  tasksThisWeek?: number;
  totalHours?: number;
  level?: number;
  xp?: number;
  streak?: number;
  badges?: string[];
  rank?: string;
  impactPoints?: number;
}

type LeaderRow = {
  user_id: string;
  full_name: string | null;
  tasks_completed: number;
  hours: number;
  points: number;
  level?: number;
  rank?: string;
};

type UserBadge = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  earned_at: string;
};

interface ProgressTrackerProps {
  userStats?: UserStats;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ userStats = {} }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [expandedLeaderboard, setExpandedLeaderboard] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load leaderboard - check if function exists first
      if (typeof V.getLeaderboard === "function") {
        const { data: lb } = await V.getLeaderboard(expandedLeaderboard ? 20 : 10);
        setLeaderboard((lb || []).map((user, index) => ({
          ...user,
          level: Math.floor((user.points || 0) / 100) + 1,
          rank: getRankFromPoints(user.points || 0)
        })));
      }

      // Load badges if available
      if (typeof V.getMyBadges === "function") {
        const { data: b } = await V.getMyBadges();
        setBadges((b as UserBadge[]) || []);
      }
    } catch (error) {
      console.error("Failed to load progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankFromPoints = (points: number): string => {
    if (points >= 1000) return "Impact Legend";
    if (points >= 500) return "Community Champion";
    if (points >= 300) return "Hero Volunteer";
    if (points >= 150) return "Dedicated Helper";
    if (points >= 50) return "Rising Star";
    return "Newcomer";
  };

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case "Impact Legend": return "from-purple-500 to-pink-500";
      case "Community Champion": return "from-emerald-500 to-teal-500";
      case "Hero Volunteer": return "from-blue-500 to-cyan-500";
      case "Dedicated Helper": return "from-orange-500 to-red-500";
      case "Rising Star": return "from-yellow-500 to-orange-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getBadgeIcon = (iconName?: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Star': Star,
      'Award': Award,
      'Flame': Flame, // Changed from Fire to Flame
      'Trophy': Trophy,
      'Package': Target,
      'Truck': Activity,
      'Clock': Clock,
      'Camera': Heart,
      'Crown': Crown
    };
    return iconMap[iconName || 'Star'] || Star;
  };

  const getLevelProgress = () => {
    const currentXP = userStats.xp || 0;
    const currentLevel = userStats.level || 1;
    const xpForNextLevel = currentLevel * 1000;
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/30 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-emerald-200/50 dark:border-emerald-700/30"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              Your Progress
            </h3>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {userStats.rank || "Newcomer"}
              </span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Level {userStats.level || 1}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.xp || 0} XP
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-emerald-600">
                  {((userStats.level || 1) * 1000) - (userStats.xp || 0)} XP
                </div>
                <div className="text-xs text-gray-500">to next level</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-lg relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${getLevelProgress()}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { 
                icon: Target, 
                label: "Tasks Done", 
                value: userStats.totalTasks || 0, 
                color: "text-emerald-600",
                change: userStats.tasksThisWeek ? `+${userStats.tasksThisWeek} this week` : undefined
              },
              { 
                icon: Clock, 
                label: "Hours", 
                value: Math.round(userStats.totalHours || 0), 
                color: "text-teal-600",
                change: "community impact"
              },
              { 
                icon: Flame, // Changed from Fire to Flame
                label: "Streak", 
                value: userStats.streak || 0, 
                color: "text-orange-500",
                change: "days active"
              },
              { 
                icon: Star, 
                label: "Impact Points", 
                value: userStats.impactPoints || 0, 
                color: "text-purple-600",
                change: "lives touched"
              }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                className="text-center p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-white/80 dark:border-gray-700/50"
              >
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
                {stat.change && (
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.change}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Card */}
      <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/50 dark:border-gray-700/30 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Community Leaderboard
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpandedLeaderboard(!expandedLeaderboard);
                if (!expandedLeaderboard) loadData();
              }}
              className="text-gray-500 hover:text-emerald-600"
            >
              {expandedLeaderboard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          <AnimatePresence>
            {leaderboard.slice(0, expandedLeaderboard ? 20 : 5).map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                  index < 3 
                    ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 border border-yellow-200 dark:border-yellow-800/30' 
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Rank Badge */}
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' 
                      : index === 1 
                      ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' 
                      : index === 2 
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {index < 3 ? (
                      <Medal className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {user.full_name || `Volunteer #${user.user_id.slice(-4)}`}
                      </span>
                      {user.rank && (
                        <Badge className={`text-xs bg-gradient-to-r ${getRankColor(user.rank)} text-white border-none`}>
                          {user.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {user.tasks_completed} tasks
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.round(user.hours)}h
                      </span>
                      {user.level && (
                        <span className="flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          Lv.{user.level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                    {user.points}
                    <Star className="w-4 h-4 ml-1 text-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leaderboard data yet.</p>
              <p className="text-xs mt-1">Start volunteering to see community rankings!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/50 dark:border-gray-700/30 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Achievements
              </span>
            </div>
            {badges.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="text-gray-500 hover:text-purple-600"
              >
                {showAllBadges ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          {badges.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {badges.slice(0, showAllBadges ? badges.length : 3).map((badge, index) => {
                  const BadgeIcon = getBadgeIcon(badge.icon);
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800/30 group hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color ? `from-${badge.color}-500 to-${badge.color}-600` : 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <BadgeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {badge.name}
                          </div>
                          {badge.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {badge.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </div>
                        <Sparkles className="w-4 h-4 text-purple-500 ml-auto mt-1" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Start Your Badge Collection
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Complete tasks, share stories, and help communities to earn achievement badges!
              </p>
              <div className="flex justify-center space-x-2 text-xs">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  First Task: 10 pts
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  Helper: 50 pts  
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  Champion: 150 pts
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;