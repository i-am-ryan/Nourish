
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { MapPin, Clock, Package, Truck, Camera, CheckCircle, Store, MapPinned } from 'lucide-react';

interface Task {
  id: number;
  type: 'pickup' | 'delivery';
  business?: string;
  destination?: string;
  location: string;
  time: string;
  items: string;
  points: number;
  status: 'available' | 'in-progress' | 'completed';
  deadline?: string;
}

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, newStatus: Task['status']) => void;
  roleFilter?: 'pickup' | 'delivery' | null;
}

const TaskBoard = ({ tasks, onTaskUpdate, roleFilter }: TaskBoardProps) => {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const taskColumns = [
    { 
      status: 'available' as const, 
      title: roleFilter === 'pickup' ? 'Available Pickups' : roleFilter === 'delivery' ? 'Available Deliveries' : 'Available Tasks',
      color: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20',
      icon: roleFilter === 'pickup' ? Store : roleFilter === 'delivery' ? MapPinned : Package 
    },
    { 
      status: 'in-progress' as const, 
      title: 'In Progress', 
      color: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20',
      icon: Truck 
    },
    { 
      status: 'completed' as const, 
      title: 'Completed This Week', 
      color: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20',
      icon: CheckCircle 
    }
  ];

  const handleTaskAction = (taskId: number, currentStatus: Task['status']) => {
    if (currentStatus === 'available') {
      onTaskUpdate(taskId, 'in-progress');
    } else if (currentStatus === 'in-progress') {
      onTaskUpdate(taskId, 'completed');
    }
  };

  const renderTaskCard = (task: Task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <GlassCard className="p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <Badge variant={task.type === 'pickup' ? 'default' : 'secondary'}>
              {task.type === 'pickup' ? (
                <Store className="w-3 h-3 mr-1" />
              ) : (
                <Truck className="w-3 h-3 mr-1" />
              )}
              {task.type === 'pickup' ? 'Pickup' : 'Delivery'}
            </Badge>
            <Badge variant="outline" className="text-green-600">
              +{task.points} points
            </Badge>
          </div>
          {task.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {task.business || task.destination}
        </h3>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{task.location}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 mr-2" />
            <span>{task.time}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Package className="w-4 h-4 mr-2" />
            <span>{task.items}</span>
          </div>
        </div>

        {/* Task Actions */}
        <div className="space-y-2">
          {task.status === 'available' && (
            <Button 
              onClick={() => handleTaskAction(task.id, task.status)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Accept {task.type === 'pickup' ? 'Pickup' : 'Delivery'}
            </Button>
          )}
          
          {task.status === 'in-progress' && (
            <div className="space-y-2">
              <Button 
                onClick={() => handleTaskAction(task.id, task.status)}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Mark as Complete
              </Button>
              <Button variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
          
          {task.status === 'completed' && (
            <div className="text-center py-2">
              <span className="text-green-600 font-medium">✓ Well done!</span>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {roleFilter === 'pickup' ? 'Pickup Tasks' : roleFilter === 'delivery' ? 'Delivery Tasks' : 'Task Board'}
        </h2>
        {roleFilter && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            {roleFilter === 'pickup' ? 'Pickup Volunteer' : 'Delivery Volunteer'}
          </Badge>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {taskColumns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          
          return (
            <div key={column.status} className={`rounded-2xl border-2 ${column.color} p-4`}>
              <div className="flex items-center mb-4">
                <column.icon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                <Badge variant="outline" className="ml-auto">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <AnimatePresence>
                {columnTasks.map(renderTaskCard)}
              </AnimatePresence>
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {column.status === 'available' && `No ${roleFilter || 'tasks'} available`}
                  {column.status === 'in-progress' && 'No active tasks'}
                  {column.status === 'completed' && 'Complete some tasks!'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;