
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CommunityStoriesSection = () => {
  return (
    <section className="py-0">
      {/* Banner Header */}
      <div className="relative w-full h-[35vh] md:h-[50vh] bg-cover bg-center group overflow-hidden">

        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('/lovable-uploads/michael-ali-KubExnaHUYE-unsplash.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
          <motion.div 
            className="text-center text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              <span className="text-white">Real </span>
              <span className="text-green-400">Stories</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto drop-shadow-md">
              Real Food. Real Impact.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Hero image with overlay */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-green-400/20">
              <img 
                src="/lovable-uploads/6b42c84e-ff53-42d6-8f40-8a5487628187.png" 
                alt="Local street vendor with fresh produce"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-green-600/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-3xl font-bold mb-2">
                  Stories of real people changing lives.
                </h3>
                <p className="text-green-100">
                  Through surplus and sharing.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-green-400 text-green-400 bg-white/10 backdrop-blur-sm hover:bg-green-400 hover:text-white transition-all duration-300 group"
                >
                  Read Stories
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Millions of South Africans go hungry while tons of good food go to waste every day. 
                NourishSA connects businesses, volunteers and communities to rescue surplus food and 
                deliver fresh meals where they're needed most — turning waste into hope, one meal at a time.
              </p>
              <div className="w-full h-48 rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/lovable-uploads/8bd521aa-c214-408d-a5c7-02c65136724a.png" 
                  alt="Happy child with healthy meal"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunityStoriesSection;
