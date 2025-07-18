
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { MapPin, Clock, Phone, Users, Map as MapIcon } from 'lucide-react';
import HubLoginModal from '@/components/hubs/HubLoginModal';
import SuburbSelector from '@/components/hubs/SuburbSelector';
import HubCard from '@/components/hubs/HubCard';
import bannerImage from '@/assets/food-hubs-banner.jpg';

const FoodHubs = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const hubsData = {
    // Johannesburg Suburbs
    'Sandton': [
      {
        id: 1,
        name: "Sandton Community Hub",
        location: "Sandton City, Johannesburg",
        hours: "Mon-Fri: 8AM-5PM",
        phone: "+27 11 883-1234",
        capacity: "120 meals/day",
        currentNeeds: ["Fresh vegetables", "Bread", "Dairy"],
        status: "open" as const,
        image: "🏢"
      }
    ],
    'Soweto': [
      {
        id: 2,
        name: "Soweto Community Kitchen",
        location: "Orlando West, Soweto",
        hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
        phone: "+27 11 935-1234",
        capacity: "200 meals/day",
        currentNeeds: ["Fresh vegetables", "Protein", "Dairy"],
        status: "open" as const,
        image: "🏘️"
      }
    ],
    'Alexandra': [
      {
        id: 3,
        name: "Alexandra Community Center",
        location: "Alexandra Township, Johannesburg",
        hours: "Mon-Fri: 6AM-8PM",
        phone: "+27 11 882-9012",
        capacity: "250 meals/day",
        currentNeeds: ["Emergency supplies needed"],
        status: "urgent" as const,
        image: "🏘️"
      }
    ],
    'Midrand': [
      {
        id: 4,
        name: "Midrand Food Hub",
        location: "Midrand Central",
        hours: "Mon-Sat: 9AM-5PM",
        phone: "+27 11 314-5678",
        capacity: "100 meals/day",
        currentNeeds: ["Rice", "Canned goods"],
        status: "open" as const,
        image: "🏢"
      }
    ],
    // Pretoria Suburbs
    'Pretoria Central': [
      {
        id: 5,
        name: "Pretoria Central Hub",
        location: "Church Street, Pretoria",
        hours: "Daily: 7AM-7PM",
        phone: "+27 12 324-7890",
        capacity: "150 meals/day",
        currentNeeds: ["Bread", "Fresh fruit"],
        status: "open" as const,
        image: "🏪"
      }
    ],
    'Mamelodi': [
      {
        id: 6,
        name: "Mamelodi Community Center",
        location: "Mamelodi East, Pretoria",
        hours: "Mon-Sat: 8AM-6PM",
        phone: "+27 12 841-2345",
        capacity: "180 meals/day",
        currentNeeds: ["Vegetables", "Cooking oil"],
        status: "busy" as const,
        image: "🏘️"
      }
    ]
  };

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleSuburbSelect = (suburb: string) => {
    setSelectedSuburb(suburb);
  };

  const getCurrentHubs = () => {
    if (!selectedSuburb) return [];
    return hubsData[selectedSuburb as keyof typeof hubsData] || [];
  };

  const handleStartJourney = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Welcome Section with Banner */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
            <img 
              src={bannerImage} 
              alt="Community food hub showing volunteers and families"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Discover Local 
                  <span className="text-green-400"> Food Hubs</span>
                </h1>
                
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                  Find food assistance near you. Browse trusted community food hubs serving Johannesburg and Pretoria suburbs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Login/Signup Prompt */}
          {!isLoggedIn && (
            <motion.div
              key="login-prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto mb-12"
            >
              <GlassCard className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome to Your Food Hub Journey
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in to find personalized food assistance in your area
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleStartJourney}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Sign In to Get Started
                  </Button>
                  <Button 
                    onClick={handleStartJourney}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Create New Account
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Suburb Selection */}
          {isLoggedIn && !selectedSuburb && (
            <motion.div
              key="suburb-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <SuburbSelector onSuburbSelect={handleSuburbSelect} />
            </motion.div>
          )}

          {/* Hub Display */}
          {isLoggedIn && selectedSuburb && (
            <motion.div
              key="hub-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Food Hubs in {selectedSuburb}
                    </h2>
                    <p className="text-gray-600">
                      {getCurrentHubs().length} hub{getCurrentHubs().length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      size="sm"
                    >
                      List View
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      onClick={() => setViewMode('map')}
                      size="sm"
                    >
                      <MapIcon className="w-4 h-4 mr-2" />
                      Map View
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setSelectedSuburb(null)}
                  className="mb-6 text-green-600 hover:text-green-700"
                >
                  ← Change Location
                </Button>
              </div>

              {viewMode === 'list' ? (
                <div className="grid gap-6">
                  {getCurrentHubs().map((hub, index) => (
                    <motion.div
                      key={hub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <HubCard hub={hub} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Interactive Map View
                    </h3>
                    <p className="text-gray-600">
                      Showing {getCurrentHubs().length} hub{getCurrentHubs().length !== 1 ? 's' : ''} in {selectedSuburb}
                    </p>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Information */}
        {isLoggedIn && selectedSuburb && (
          <motion.div
            className="mt-16 grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <GlassCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How Food Hubs Work</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Community-operated distribution points</li>
                <li>• Fresh food delivered daily by volunteers</li>
                <li>• No questions asked, dignified service</li>
                <li>• Additional support services available</li>
              </ul>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Our food hubs are here to support you and your family. All services are free and 
                provided with respect and dignity.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 Email: help@nourishsa.org</p>
                <p>💬 WhatsApp: +27 60 123 4567</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Login Modal */}
      <HubLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default FoodHubs;