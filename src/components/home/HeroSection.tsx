
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Users } from 'lucide-react';
import AppleHelloEffect from '@/components/AppleHelloEffect';
import VapourTextEffect from '@/components/VapourTextEffect';
import RotatingTestimonials from '@/components/RotatingTestimonials';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with volunteers/donations image */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/5dc9098b-8964-42a8-935a-c2d71b59445a.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <AppleHelloEffect />
        
        <VapourTextEffect 
          text="Let's Nourish South Africa Together" 
          className="text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-lg"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-white drop-shadow-lg">Turning everyday </span>
            <span className="text-green-400 drop-shadow-lg">Surplus</span>
            <span className="text-white drop-shadow-lg"> into everyday meals</span>
          </div>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md mb-6">
            for South African families
          </p>
          
          {/* Rotating Testimonials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <RotatingTestimonials />
          </motion.div>
        </motion.div>

        {/* Impact badges */}
        <motion.div 
          className="flex justify-center items-center gap-6 mb-8 text-sm text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 drop-shadow-lg">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Verified Donors</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 drop-shadow-lg">
            <Users className="w-4 h-4 text-green-400" />
            <span>500+ Active Volunteers</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 drop-shadow-lg">
            <Star className="w-4 h-4 text-green-400" />
            <span>15,000+ Meals Served</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <Button asChild size="lg" className="bg-green-400 hover:bg-green-500 text-white text-lg px-8 py-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-green-400/25 group rounded-xl">
            <Link to="/surplus">
              Join as Donor 
              <span className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                <ArrowRight size={20} />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-green-400 text-white bg-transparent hover:bg-green-400 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-green-400/25 transition-all duration-300 ease-in-out group rounded-xl backdrop-blur-sm">
            <Link to="/volunteer">
              Become a Volunteer
              <span className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                <ArrowRight size={16} />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-orange-400 text-orange-400 bg-transparent hover:bg-orange-400 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-400/25 transition-all duration-300 ease-in-out group rounded-xl backdrop-blur-sm">
            <Link to="/hubs">
              Find Food Now
              <span className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                <ArrowRight size={16} />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
