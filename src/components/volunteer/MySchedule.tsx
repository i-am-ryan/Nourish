import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronRight,
  Filter,
  CalendarDays,
  Star,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as V from "@/lib/volunteer";
import type { VolunteerTask } from "@/lib/supabase";

type FilterType = 'all' | 'upcoming' | 'completed' | 'in_progress';

// Extended task type to include points_reward if needed
interface ExtendedVolunteerTask extends VolunteerTask {
  points_reward?: number;
}

const MySchedule: React.FC = () => {
  const [tasks, setTasks] = useState<ExtendedVolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await V.listMyTasks();
      if (error) throw error;
      
      const sortedTasks = (data || []).sort((a, b) => {
        // Use scheduled_date instead of scheduled_start
        const dateA = new Date(a.scheduled_date || a.created_at).getTime();
        const dateB = new Date(b.scheduled_date || b.created_at).getTime();
        return dateA - dateB;
      });
      
      setTasks(sortedTasks);
    } catch (error) {
      toast({
        title: "Error loading schedule",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assigned': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in_progress': return Timer;
      case 'assigned': return AlertCircle;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['open', 'assigned'].includes(task.status);
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'in_progress') return task.status === 'in_progress';
    return true;
  });

  const filters = [
    { id: 'all' as const, label: 'All Tasks', count: tasks.length },
    { id: 'upcoming' as const, label: 'Upcoming', count: tasks.filter(t => ['open', 'assigned'].includes(t.status)).length },
    { id: 'in_progress' as const, label: 'Active', count: tasks.filter(t => t.status === 'in_progress').length },
    { id: 'completed' as const, label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Flexible timing';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-ZA', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to calculate default points based on task properties
  const getTaskPoints = (task: ExtendedVolunteerTask): number => {
    if (task.points_reward) return task.points_reward;
    
    // Calculate default points based on task type and estimated duration
    const basePoints = task.task_type === 'delivery' ? 50 : 30;
    const durationMultiplier = task.estimated_duration ? Math.ceil(task.estimated_duration / 30) : 1;
    const priorityMultiplier = task.priority === 'urgent' ? 2 : task.priority === 'high' ? 1.5 : 1;
    
    return Math.round(basePoints * durationMultiplier * priorityMultiplier);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <Calendar className="absolute inset-0 m-auto h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-gray-600 dark:text-gray-300">Loading your schedule...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
            <CalendarDays className="w-6 h-6 mr-3 text-emerald-600" />
            My Volunteer Schedule
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your upcoming tasks and track your impact
          </p>
        </div>
        
        <Button 
          onClick={loadTasks}
          variant="outline"
          className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {filters.map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? "default" : "outline"}
            onClick={() => setFilter(f.id)}
            className={`relative group ${
              filter === f.id 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg" 
                : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-700 dark:hover:bg-emerald-900/20"
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {f.label}
            {f.count > 0 && (
              <Badge 
                variant="secondary" 
                className={`ml-2 ${
                  filter === f.id 
                    ? "bg-white/20 text-white" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                }`}
              >
                {f.count}
              </Badge>
            )}
          </Button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <AnimatePresence mode="wait">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'Start accepting tasks from the task board to see them here'
                  : `You don't have any ${filter.replace('_', ' ')} tasks at the moment`
                }
              </p>
              <Button 
                onClick={() => setFilter('all')}
                variant="outline"
                className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
              >
                View All Tasks
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredTasks.map((task, index) => {
              const StatusIcon = getStatusIcon(task.status);
              const taskPoints = getTaskPoints(task);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full"></div>
                  </div>

                  <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
                    {/* Task Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                            task.task_type === 'pickup' 
                              ? 'from-purple-500 to-pink-500' 
                              : 'from-orange-500 to-red-500'
                          } flex items-center justify-center shadow-lg`}>
                            {task.task_type === 'pickup' ? 
                              <Package className="w-6 h-6 text-white" /> : 
                              <Truck className="w-6 h-6 text-white" />
                            }
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors duration-300">
                              {task.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>{task.city}</span>
                              {task.suburb && <span>• {task.suburb}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status & Priority Badges */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
                          <Badge className={`${getStatusColor(task.status)} flex items-center space-x-1`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge className={`border ${getPriorityColor(task.priority)} capitalize`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Task Details */}
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Time and Duration */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(task.scheduled_date)}</span>
                        </div>
                        {task.estimated_duration && (
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4" />
                            <span>{task.estimated_duration} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{taskPoints} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Progress Bar for In-Progress Tasks */}
                  {task.status === 'in_progress' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task in progress
                        </span>
                        <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30"
        >
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-emerald-600" />
            Your Impact Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filters.slice(1).map((stat, idx) => (
              <div key={stat.id} className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{stat.count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {stat.label} Tasks
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MySchedule;