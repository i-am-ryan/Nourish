import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import GlassCard from '@/components/GlassCard';
import { ArrowRight, Users, Heart, Truck, MapPin, Star } from 'lucide-react';

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const location = useLocation();

  // Check if user is coming from signup route
  React.useEffect(() => {
    if (location.pathname === '/signup') {
      setIsSignUp(true);
    }
  }, [location.pathname]);

  const testimonials = [
    {
      text: "NourishSA helped us feed 12 families in our community last month.",
      author: "Sarah Mthembu, Community Leader",
      rating: 5,
      location: " Soweto"
    },
    {
      text: "As a volunteer driver, I see the real impact we make every day.",
      author: "Keagile Chauke , Volunteer",
      rating: 5,
      location: "Johannesburg"
    },
    {
      text: "Our restaurant surplus now helps local families instead of going to waste.",
      author: "Ahmed Hassan, Restaurant Owner",
      rating: 5,
      location: "Sandton"
    }
  ];

  const stats = [
    { icon: Users, label: "Families Fed", value: "1,000+", color: "text-emerald-600" },
    { icon: Heart, label: "Meals Distributed", value: "1,200+", color: "text-red-500" },
    { icon: Truck, label: "Active Volunteers", value: "50+", color: "text-blue-600" },
    { icon: MapPin, label: "Cities Served", value: "11+", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-emerald-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-16 items-stretch min-h-[calc(100vh-8rem)]">
            
            {/* Left Side - Auth Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center"
            >
              {isSignUp ? (
                <SignUpForm onToggleMode={() => setIsSignUp(false)} />
              ) : (
                <SignInForm onToggleMode={() => setIsSignUp(true)} />
              )}
            </motion.div>

            {/* Right Side - Dynamic Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-center space-y-12 relative"
            >
              
              {/* Hero Section */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Join Our 
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Community</span>
                    <br />
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Together, we're connecting surplus food to families in need across South Africa.
                  </p>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center justify-center lg:justify-start space-x-4"
                >
                  <div className="flex items-center space-x-2 text-emerald-600 font-medium">
                    <span>Get started today</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-2 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      y: -5
                    }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Testimonials */}
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                      y: -3
                    }}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Rating stars */}
                        <div className="flex items-center space-x-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.4 + index * 0.2 + i * 0.1 }}
                            >
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </motion.div>
                          ))}
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed font-medium">
                          "{testimonial.text}"
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {testimonial.author}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {testimonial.location}
                              </p>
                            </div>
                          </div>
                          
                          {/* Avatar placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                            {testimonial.author.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating Action Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 2 }}
                className="absolute top-20 right-10 hidden xl:block"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Impact Tracking</span>
                  </div>
                </motion.div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;