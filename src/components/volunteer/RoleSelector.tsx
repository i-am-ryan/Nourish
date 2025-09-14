import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Truck, 
  ArrowLeft, 
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Heart,
  Sparkles,
  Target,
  Award,
  TrendingUp,
  Globe,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "pickup" | "delivery";

interface RoleSelectorProps {
  userName: string;
  onRoleSelect: (role: Role) => void;
  onBack: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ userName, onRoleSelect, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);

  const roles = [
    {
      id: "pickup" as Role,
      title: "Food Rescue Champion",
      subtitle: "Save surplus, prevent waste",
      description: "Collect surplus food from restaurants, supermarkets, and events before it goes to waste. Be the first link in the chain of compassion, turning waste into hope.",
      icon: Package,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50/80 via-teal-50/60 to-cyan-50/80",
      darkBgGradient: "from-emerald-900/30 via-teal-900/20 to-cyan-900/30",
      features: [
        { icon: Clock, text: "Flexible scheduling", desc: "Choose when you volunteer" },
        { icon: MapPin, text: "Partner network access", desc: "Work with trusted businesses" },
        { icon: TrendingUp, text: "Real-time impact tracking", desc: "See your environmental impact" },
        { icon: Leaf, text: "Environmental champion", desc: "Directly fight food waste" }
      ],
      stats: {
        avgTasks: "12-15",
        impact: "25kg food/week",
        timeCommitment: "2-4 hours"
      },
      benefits: [
        "Prevent 25kg+ food waste weekly",
        "Build relationships with local businesses", 
        "Flexible timing around your schedule",
        "Direct environmental impact tracking"
      ]
    },
    {
      id: "delivery" as Role,
      title: "Delivery Hero",
      subtitle: "Bring hope to doorsteps",
      description: "Transport rescued food and prepared meals directly to families and communities in need. Create meaningful connections while nourishing your neighbors.",
      icon: Truck,
      gradient: "from-teal-500 via-cyan-500 to-blue-500",
      bgGradient: "from-teal-50/80 via-cyan-50/60 to-blue-50/80",
      darkBgGradient: "from-teal-900/30 via-cyan-900/20 to-blue-900/30",
      features: [
        { icon: MapPin, text: "Optimized routes", desc: "Smart delivery planning" },
        { icon: Users, text: "Community connections", desc: "Meet the families you help" },
        { icon: Award, text: "Safety protocols", desc: "Full training and support" },
        { icon: Heart, text: "Meaningful interactions", desc: "See your impact firsthand" }
      ],
      stats: {
        avgTasks: "8-12",
        impact: "40+ meals/week",
        timeCommitment: "3-5 hours"
      },
      benefits: [
        "Deliver 40+ meals to families weekly",
        "Build lasting community connections",
        "Receive comprehensive safety training", 
        "Witness the direct impact of your work"
      ]
    }
  ];

  const handleRoleSelect = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const currentRole = selectedRole || hoveredRole;
  const displayRole = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl relative"
        >
          <Target className="w-10 h-10 text-white" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome, {userName}!
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Choose Your Impact Path
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Every volunteer role creates meaningful change. Select the path that resonates with your passion 
          for helping others and fighting food waste.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
            className={`relative overflow-hidden cursor-pointer group transition-all duration-500 rounded-3xl ${
              selectedRole === role.id 
                ? `bg-gradient-to-br ${role.bgGradient} dark:${role.darkBgGradient} shadow-2xl scale-105 border-2 border-emerald-300 dark:border-emerald-600` 
                : `bg-white/70 dark:bg-gray-800/70 hover:bg-gradient-to-br hover:${role.bgGradient} dark:hover:${role.darkBgGradient} shadow-lg hover:shadow-2xl hover:scale-102 border border-white/50 dark:border-gray-700/30`
            }`}
            onClick={() => setSelectedRole(role.id)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-full"></div>
            </div>

            {/* Selection Indicator */}
            {selectedRole === role.id && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <ChevronRight className="w-5 h-5 text-white transform rotate-90" />
              </div>
            )}

            <div className="relative p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {role.title}
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {role.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {role.description}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                {role.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {feature.text}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 border border-white/50 dark:border-gray-700/30">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Typical Impact
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {role.stats.avgTasks}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      tasks/month
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {role.stats.impact}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      average impact
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {role.stats.timeCommitment}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      per week
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Hint */}
              <div className={`text-center transition-all duration-300 ${
                selectedRole === role.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Selected! Continue below to start your journey</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Role Information */}
      <motion.div
        key={currentRole}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 dark:border-gray-700/30 mb-12"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${displayRole.gradient} flex items-center justify-center shadow-lg`}>
            <displayRole.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayRole.title} Benefits
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              What you'll achieve in this role
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-emerald-600" />
              Key Benefits
            </h4>
            <ul className="space-y-3">
              {displayRole.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-emerald-600" />
              Community Impact
            </h4>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Environmental Impact
                </div>
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {displayRole.id === 'pickup' ? '850kg CO₂ saved monthly' : '1,200 meals delivered monthly'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
      >
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 px-8 py-4 rounded-2xl group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Welcome
        </Button>

        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole}
          size="lg"
          className={`px-12 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 ${
            selectedRole
              ? `bg-gradient-to-r ${displayRole.gradient} hover:scale-105 hover:shadow-2xl text-white`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } group`}
        >
          <Target className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
          Start My Volunteer Journey
          <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>25,000+ Active Volunteers</span>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Comprehensive Training</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-emerald-600" />
          <span>Community Verified</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;