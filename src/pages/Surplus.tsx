
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import DonateSurplusForm from '@/components/surplus/DonateSurplusForm';
import ClaimSurplusForm from '@/components/surplus/ClaimSurplusForm';
import { 
  Plus, 
  Heart,
  Gift,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Truck
} from 'lucide-react';

const Surplus = () => {
  const [activeFlow, setActiveFlow] = useState<'none' | 'donate' | 'claim'>('none');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDonateSubmit = (data: any) => {
    // AI Surplus Matcher logic would go here
    setSuccessMessage("Thank you! Your food is going to Soweto Community Kitchen. Volunteer Mary will pick up at 4PM today.");
    setActiveFlow('none');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleClaimSubmit = (data: any) => {
    // AI Surplus Matcher logic would go here
    setSuccessMessage(`Perfect! We found 5kg fresh vegetables from SuperSpar Sandton. Volunteer John will deliver to ${data.location} within 2 hours.`);
    setActiveFlow('none');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const howItWorks = [
    {
      title: "Smart Geo-Matching",
      description: "AI matches donors and recipients based on location, food type, and urgency for optimal distribution efficiency",
      icon: MapPin,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-100",
      image: "/lovable-uploads/geojango-maps-Z8UgB80_46w-unsplash.jpg"
    },
    {
      title: "Volunteer Network", 
      description: "Verified volunteers handle pickup and delivery with WhatsApp coordination and real-time tracking",
      icon: Users,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-100",
      image: "/lovable-uploads/alexander-simonsen-44al1GlFVxo-unsplash.jpg"
    },
    {
      title: "Real-Time Tracking",
      description: "Live status updates for donors, recipients, and volunteers throughout the entire process",
      icon: Clock,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-100",
      image: "/lovable-uploads/jack-b-_6KWbHyfJDE-unsplash.jpg"
    }
  ];

  const stats = [
    { 
      number: '2,847', 
      label: 'Meals Shared',
      icon: Gift,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-100"
    },
    { 
      number: '156', 
      label: 'Active Donors',
      icon: Heart,
      color: "from-blue-400 to-blue-600", 
      bgColor: "bg-blue-100"
    },
    { 
      number: '89', 
      label: 'Verified Recipients',
      icon: Users,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      number: '45', 
      label: 'Volunteer Drivers',
      icon: Truck,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-lg max-w-md">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  <p className="font-medium">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Header */}
        <div className="relative w-full h-[50vh] bg-cover bg-center group overflow-hidden rounded-2xl mb-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('/lovable-uploads/c84c72dc-5e01-4b9e-a7c8-fcc3dbfcf5e6.png')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center rounded-2xl">
            <motion.div 
              className="text-center text-white px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                <span className="text-white"> Surplus </span>
                <span className="text-green-400">Hub</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto drop-shadow-md">
                Smart matching system that connects surplus food with verified recipients through local volunteers
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeFlow === 'none' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Action Selection */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                  {/* Donate Card with Background Image */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl cursor-pointer group h-full"
                      onClick={() => setActiveFlow('donate')}
                    >
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('/lovable-uploads/c84c72dc-5e01-4b9e-a7c8-fcc3dbfcf5e6.png')`
                        }}
                      />
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-green-600/80" />
                      
                      {/* Content */}
                      <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-colors">
                          <Gift className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Donate Surplus Food</h2>
                        <p className="mb-6 leading-relaxed opacity-90">
                          Share your excess food with local families, orphanages, and community kitchens through our AI matching system
                        </p>
                        <div className="flex items-center justify-center font-semibold group-hover:text-green-200">
                          Start Donating <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Claim Card with Background Image */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl cursor-pointer group h-full"
                      onClick={() => setActiveFlow('claim')}
                    >
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('/lovable-uploads/43610b4f-4ed2-47c5-a256-a969da6fd0f7.png')`
                        }}
                      />
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-blue-600/80" />
                      
                      {/* Content */}
                      <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-colors">
                          <Heart className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Claim Surplus Food</h2>
                        <p className="mb-6 leading-relaxed opacity-90">
                          Access fresh surplus food for your family, organization, or community through verified local donors
                        </p>
                        <div className="flex items-center justify-center font-semibold group-hover:text-blue-200">
                          Start Claiming <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* How It Works Section with Enhanced Visuals */}
                <GlassCard className="p-8 mb-12">
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      How <span className="text-green-600">AI Surplus Matching</span> Works
                    </h3>
                    <motion.p 
                      className="text-gray-600 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      Smart technology connecting surplus with community needs
                    </motion.p>
                  </motion.div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    {howItWorks.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="text-center group cursor-pointer"
                      >
                        <motion.div 
                          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full"
                          whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Background Image */}
                          <div className="mb-6 relative overflow-hidden rounded-xl">
                            <motion.img 
                              src={item.image}
                              alt={item.title}
                              className="w-full h-32 object-cover transition-transform duration-500"
                              whileHover={{ scale: 1.1 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          <motion.div 
                            className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                            whileHover={{ 
                              scale: 1.2, 
                              rotate: 10,
                              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <item.icon size={24} />
                          </motion.div>
                          
                          <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-green-600 transition-colors duration-300">
                            {item.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Enhanced Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center group"
                    >
                      <motion.div 
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.05,
                          y: -5,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Hover Background Effect */}
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />
                        
                        <motion.div 
                          className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 10
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <stat.icon size={20} />
                        </motion.div>
                        
                        <motion.div 
                          className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          viewport={{ once: true }}
                        >
                          {stat.number}
                        </motion.div>
                        
                        <div className="text-gray-600 text-sm font-medium group-hover:text-gray-700 transition-colors duration-300">
                          {stat.label}
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeFlow === 'donate' && (
              <motion.div
                key="donate"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8 max-w-2xl mx-auto">
                  <DonateSurplusForm
                    onSubmit={handleDonateSubmit}
                    onCancel={() => setActiveFlow('none')}
                  />
                </GlassCard>
              </motion.div>
            )}

            {activeFlow === 'claim' && (
              <motion.div
                key="claim"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8 max-w-2xl mx-auto">
                  <ClaimSurplusForm
                    onSubmit={handleClaimSubmit}
                    onCancel={() => setActiveFlow('none')}
                  />
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Surplus;
