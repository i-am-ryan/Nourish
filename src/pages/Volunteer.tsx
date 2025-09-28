import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import VerificationForm from "@/components/volunteer/VerificationForm";
import {
  Calendar,
  Camera,
  Target,
  Truck,
  Package,
  Sparkles,
  Trophy,
  Users,
  Star,
  Zap,
  Shield,
  Crown,
  Award,
  TrendingUp,
  Clock,
  Leaf,
  HandHeart,
} from "lucide-react";

import HeroImpactSection from "@/components/volunteer/HeroImpactSection";
import TaskBoard from "@/components/volunteer/TaskBoard";
import ProgressTracker from "@/components/volunteer/ProgressTracker";
import CommunityFeed from "@/components/volunteer/CommunityFeed";
import MySchedule from "@/components/volunteer/MySchedule";
import * as V from "@/lib/volunteer";

type TabId = "tasks" | "impact" | "stories" | "schedule" | "verification" | "admin";
type Role = "pickup" | "delivery";

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

/* -------------------- Admin Manager (unchanged) -------------------- */
const AdminTaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    task_type: "pickup" as Role,
    city: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await V.adminListTasks();
      setTasks(data || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await V.adminCreateTask(newTask);
      setNewTask({
        title: "",
        description: "",
        task_type: "pickup",
        city: "",
        priority: "medium",
      });
      loadTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 dark:border-gray-700/50">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Task Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create and manage volunteer tasks across the platform.
          </p>
        </div>

        <form onSubmit={createTask} className="grid gap-4 md:grid-cols-2 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Type
            </label>
            <select
              value={newTask.task_type}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  task_type: e.target.value as Role,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Task description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={newTask.city}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="City location..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  priority: e.target.value as
                    | "low"
                    | "medium"
                    | "high"
                    | "urgent",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Create Task
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading tasks...
                </span>
              </div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid gap-3">
              {tasks.slice(0, 5).map((task: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title || `Task #${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.city || "Location TBD"} • {task.task_type || "pickup"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {task.priority || "medium"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Main Page --------------------------------- */
const Volunteer: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] =
    useState<"role-selection" | "hub">("role-selection");
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [showAchievement, setShowAchievement] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalTasks: 0,
    tasksThisWeek: 0,
    totalHours: 0,
    level: 1,
    xp: 0,
    streak: 0,
    badges: [],
    rank: "Newcomer",
    impactPoints: 0,
  });

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!user) return;

        const [profileResult, statsResult] = await Promise.allSettled([
          V.getProfile(),
          V.getUserStats ? V.getUserStats(user.id) : Promise.resolve({ data: null }),
        ]);

        if (cancelled) return;

        if (profileResult.status === "fulfilled") {
          const roleFromDb =
            (profileResult.value.data?.volunteer_role as Role | null) ?? null;
          const roleFromLocal =
            (localStorage.getItem("volunteer_role") as Role | null) ?? null;
          const role = roleFromDb || roleFromLocal || null;
          if (role) setSelectedRole(role);
        }

        if (statsResult.status === "fulfilled" && statsResult.value.data) {
          const s = statsResult.value.data as Partial<UserStats>;
          setUserStats({
            totalTasks: s.totalTasks ?? 0,
            tasksThisWeek: s.tasksThisWeek ?? 0,
            totalHours: s.totalHours ?? 0,
            level: s.level ?? 1,
            xp: s.xp ?? 0,
            streak: s.streak ?? 0,
            badges: s.badges ?? [],
            rank: getRankFromLevel(s.level ?? 1),
            impactPoints: (s.totalTasks ?? 0) * 50 + (s.totalHours ?? 0) * 25,
          });
        }
      } catch (e) {
        console.error("[Volunteer] hydrate error:", e);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const getRankFromLevel = (level: number): string => {
    if (level >= 50) return "Impact Legend";
    if (level >= 25) return "Community Champion";
    if (level >= 15) return "Hero Volunteer";
    if (level >= 10) return "Dedicated Helper";
    if (level >= 5) return "Rising Star";
    return "Newcomer";
  };

  const persistRole = async (role: Role) => {
    localStorage.setItem("volunteer_role", role);
    try {
      await V.upsertPreferredRole(role);
    } catch (err) {
      console.error("[Volunteer] upsertPreferredRole failed:", err);
    }
  };

  const handleSwitchRole = () => {
    setSelectedRole(null);
    localStorage.removeItem("volunteer_role");
    setCurrentView("role-selection");
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    localStorage.removeItem("volunteer_role");
    setCurrentView("role-selection");
  };

  const handleAdminPanel = () => {
    if (isAdmin) navigate("/admin/volunteer-tasks");
  };

  /* --------------------------------- Screens --------------------------------- */
  if (hydrating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/40 dark:from-gray-900 dark:via-emerald-900/5 dark:to-gray-900">
        <div className="min-h-screen grid place-items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 text-center p-8"
          >
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <HandHeart className="h-8 w-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Preparing Your Impact Hub
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Loading your volunteer journey and community impact data...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ---- ROLE SELECTION ---- */
  if (currentView === "role-selection") {
    const selectRole = async (role: Role) => {
      setSelectedRole(role);
      await persistRole(role);
      setCurrentView("hub");
    };

    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* HERO with wave bottom & blobs (unique from Surplus) */}
          <div className="relative w-full h-[50vh] overflow-hidden mb-14">
            <div
              className="absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-700"
              style={{
                backgroundImage:
                  "url('/lovable-uploads/joel-muniz-A4Ax1ApccfA-unsplash.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/35 to-black/25" />
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-emerald-500/25 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-teal-500/25 blur-2xl" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white text-4xl md:text-6xl font-extrabold tracking-tight"
              >
                Welcome, {user?.email?.split("@")[0] || "Hero"}!
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-3 text-emerald-300 text-2xl md:text-4xl font-bold"
              >
                Choose Your Impact Path
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 text-gray-100/90 max-w-3xl text-lg"
              >
                Select the path that resonates with your passion for helping others
                and fighting food waste.
              </motion.p>
            </div>

            <svg
              className="absolute -bottom-px left-0 w-full h-20"
              viewBox="0 0 1440 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,80 C200,0 420,0 720,80 C1020,160 1240,160 1440,80 L1440,100 L0,100 Z"
                fill="white"
                opacity="0.95"
              />
            </svg>
          </div>

          {/* ROLE CARDS (different colours, full-card click, hover effects) */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Food Rescue — emerald gradient, notched BR */}
            <div
              onClick={() => selectRole("pickup")}
              className="group relative overflow-hidden border border-emerald-200/60 shadow-xl cursor-pointer will-change-transform transition-all duration-300 hover:-translate-y-1 hover:rotate-[0.3deg] hover:shadow-emerald-200/60 hover:shadow-2xl"
              style={{
                clipPath:
                  "polygon(0 0,100% 0,100% calc(100% - 28px),calc(100% - 28px) 100%,0 100%)",
                borderRadius: "22px",
              }}
            >
              {/* bg image with subtle parallax */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('/lovable-uploads/43610b4f-4ed2-47c5-a256-a969da6fd0f7.png')",
                }}
              />
              {/* emerald overlay (left) */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/75 via-emerald-700/65 to-green-700/60 mix-blend-multiply" />
              {/* shine sweep */}
              <div className="pointer-events-none absolute -inset-y-10 -left-1/2 w-2/3 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent blur-xl transform translate-x-[-30%] group-hover:translate-x-[130%] transition-transform duration-700" />
              </div>

              <div className="relative z-10 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold leading-tight">
                      Food Rescue Champion
                    </h3>
                    <p className="text-emerald-200 font-medium -mt-0.5">
                      Save surplus, prevent waste
                    </p>
                  </div>
                </div>

                <p className="opacity-95 mb-5">
                  Collect surplus food from restaurants, supermarkets, and events
                  before it goes to waste. Be the first link in the chain of compassion,
                  turning waste into hope.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-2 text-sm">
                  {[
                    ["Flexible scheduling", "Choose when you volunteer"],
                    ["Partner network access", "Work with trusted businesses"],
                    ["Real-time impact tracking", "See your environmental impact"],
                    ["Environmental champion", "Directly fight food waste"],
                  ].map(([title, desc], i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-[2px]">
                      <div className="font-semibold">{title}</div>
                      <div className="text-white/80">{desc}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-emerald-200 text-sm">
                    Typical impact: 25kg+ food saved weekly
                  </div>
                  <div className="text-white/90 text-sm font-semibold group-hover:text-emerald-200 transition-colors">
                    Tap to choose →
                  </div>
                </div>
              </div>

              {/* notch fill */}
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-white/90" />
            </div>

            {/* Delivery — teal/cyan gradient, diagonal TL */}
            <div
              onClick={() => selectRole("delivery")}
              className="group relative overflow-hidden border border-teal-200/60 shadow-xl cursor-pointer will-change-transform transition-all duration-300 hover:-translate-y-1 hover:-rotate-[0.3deg] hover:shadow-teal-200/60 hover:shadow-2xl"
              style={{
                clipPath:
                  "polygon(28px 0,100% 0,100% 100%,0 100%,0 28px)",
                borderRadius: "22px",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('/lovable-uploads/geojango-maps-Z8UgB80_46w-unsplash.jpg')",
                }}
              />
              {/* teal→cyan overlay (right) */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-800/70 via-teal-700/65 to-cyan-700/60 mix-blend-multiply" />
              {/* shine sweep */}
              <div className="pointer-events-none absolute -inset-y-10 -left-1/2 w-2/3 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent blur-xl transform translate-x-[-30%] group-hover:translate-x-[130%] transition-transform duration-700" />
              </div>

              <div className="relative z-10 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold leading-tight">Delivery Hero</h3>
                    <p className="text-emerald-200 font-medium -mt-0.5">
                      Bring hope to doorsteps
                    </p>
                  </div>
                </div>

                <p className="opacity-95 mb-5">
                  Bring nutritious meals directly to families and communities. Create
                  meaningful connections while nourishing your neighbors.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-2 text-sm">
                  {[
                    ["Optimized routes", "Smart delivery planning"],
                    ["Community connections", "Meet the families you help"],
                    ["Safety protocols", "Clear, simple guidance"],
                    ["Heartfelt interactions", "Impact you can see"],
                  ].map(([title, desc], i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-[2px]">
                      <div className="font-semibold">{title}</div>
                      <div className="text-white/80">{desc}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-emerald-200 text-sm">
                    Typical impact: 15+ families served weekly
                  </div>
                  <div className="text-white/90 text-sm font-semibold group-hover:text-teal-200 transition-colors">
                    Tap to choose →
                  </div>
                </div>
              </div>

              {/* diagonal cut fill */}
              <div className="absolute top-0 left-0 w-7 h-7 bg-white/90" />
            </div>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Verified Impact Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Community Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Planet-first Mission</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- HUB ---- */
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/40 dark:from-gray-900 dark:via-emerald-900/5 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 dark:border-gray-700/30">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between mb-8">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    <span className="text-gray-800 dark:text-white">Welcome back,</span>{" "}
                    <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                      {user?.email?.split("@")[0] || "Hero"}!
                    </span>
                  </h1>
                  {userStats.streak > 0 && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      <Zap className="w-4 h-4" />
                      <span>{userStats.streak} day streak!</span>
                    </div>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  Ready to continue your impact as a{" "}
                  <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent capitalize">
                    {selectedRole} champion
                  </span>
                  ?
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>{userStats.rank}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span>{userStats.impactPoints} Impact Points</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-xl relative">
                    <Crown className="w-10 h-10 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border">
                    <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Level {userStats.level}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {userStats.rank}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {[
                { label: "Tasks Completed", value: userStats.totalTasks, icon: Target },
                { label: "Impact Hours", value: userStats.totalHours, icon: Clock },
                { label: "Impact Streak", value: userStats.streak, icon: Zap },
                { label: "Total XP", value: userStats.xp, icon: Star },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-4 border border-white/50 dark:border-gray-700/30"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
          <div className="flex bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-2xl p-2 shadow-xl border border-white/50 dark:border-gray-700/30 overflow-x-auto">
            {[
              {
                id: "tasks",
                label: "Active Tasks",
                icon: selectedRole === "pickup" ? Package : Truck,
                gradient:
                  activeTab === "tasks"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
              },
              {
                id: "impact",
                label: "My Impact",
                icon: TrendingUp,
                gradient:
                  activeTab === "impact"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                    : "hover:bg-teal-50 dark:hover:bg-teal-900/20",
              },
              {
                id: "stories",
                label: "Community",
                icon: Camera,
                gradient:
                  activeTab === "stories"
                    ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
              },

              {
                id: "schedule",
                label: "Schedule",
                icon: Calendar,
                gradient:
                  activeTab === "schedule"
                    ? "bg-gradient-to-r from-lime-500 to-emerald-500 text-white shadow-lg"
                    : "hover:bg-lime-50 dark:hover:bg-emerald-900/20",
              },

               {
    id: "verification",
    label: "Get Verified",
    icon: Shield,
    gradient:
      activeTab === "verification"
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
        : "hover:bg-purple-50 dark:hover:bg-purple-900/20",
  },
              ...(isAdmin
                ? [
                    {
                      id: "admin" as const,
                      label: "Admin",
                      icon: Shield,
                      gradient:
                        activeTab === "admin"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                          : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                    },
                  ]
                : []),
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${tab.gradient} group`}
              >
                <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "tasks" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TaskBoard
                    roleFilter={selectedRole}
                    userStats={userStats}
                    setUserStats={setUserStats}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ProgressTracker userStats={userStats} />
                </div>
              </div>
            )}

            {activeTab === "impact" && (
              <div className="max-w-6xl mx-auto space-y-8">
                <HeroImpactSection userStats={userStats} />
                <ProgressTracker userStats={userStats} />
              </div>
            )}

            {activeTab === "stories" && <CommunityFeed />}

            {activeTab === "schedule" && (
              <div className="max-w-4xl mx-auto">
                <MySchedule />
              </div>
            )}

            {activeTab === "verification" && (
  <div className="max-w-4xl mx-auto">
    <VerificationForm />
  </div>
)}

            {activeTab === "admin" && isAdmin && (
              <div className="max-w-6xl mx-auto">
                <AdminTaskManager />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Role Controls */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 shadow-2xl rounded-2xl px-3 py-2">
            <Button
              variant="outline"
              onClick={handleSwitchRole}
              className="rounded-xl border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
              title="Switch Role"
            >
              Switch Role
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToRoleSelect}
              className="rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              title="Back to Role Selection"
            >
              Back
            </Button>
          </div>
        </div>

{/* Achievement toast */}
{userStats.level > 1 && showAchievement && !sessionStorage.getItem('achievement_shown') && (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    className="fixed bottom-28 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-2xl max-w-sm z-40"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <Trophy className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold">Achievement Unlocked!</div>
        <div className="text-sm opacity-90">You're now a {userStats.rank}!</div>
      </div>
      <button
        onClick={() => {
          setShowAchievement(false);
          sessionStorage.setItem('achievement_shown', 'true');
        }}
        className="ml-2 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  </motion.div>
)}
      </div>
    </div>
  );
};

export default Volunteer;
