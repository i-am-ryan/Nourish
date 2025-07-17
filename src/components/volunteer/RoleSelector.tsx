
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package, Truck, ArrowLeft } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface RoleSelectorProps {
  userName: string;
  onRoleSelect: (role: 'pickup' | 'delivery') => void;
  onBack: () => void;
}

const RoleSelector = ({ userName, onRoleSelect, onBack }: RoleSelectorProps) => {
  const roles = [
    {
      id: 'pickup' as const,
      title: 'Pickup Volunteer',
      description: 'Collect surplus food from restaurants, grocery stores, and businesses',
      icon: Package,
      color: 'bg-purple-500 hover:bg-purple-600',
      examples: ['Restaurant pickups', 'Grocery store collections', 'Business surplus']
    },
    {
      id: 'delivery' as const,
      title: 'Delivery Volunteer',
      description: 'Deliver food packages to community hubs and families in need',
      icon: Truck,
      color: 'bg-orange-500 hover:bg-orange-600',
      examples: ['Community hub deliveries', 'Family doorstep drops', 'Emergency deliveries']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {userName}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your volunteer role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: role.id === 'pickup' ? 0.2 : 0.4 }}
            >
              <GlassCard className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-full ${role.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {role.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {role.description}
                  </p>
                  
                  <div className="space-y-2 mb-8">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Examples:
                    </p>
                    <ul className="space-y-1">
                      {role.examples.map((example, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => onRoleSelect(role.id)}
                    className={`w-full ${role.color} text-white font-semibold py-3 rounded-xl`}
                    size="lg"
                  >
                    Choose {role.title}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can switch between roles anytime from your volunteer hub
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;