
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Users, HomeIcon, Package } from 'lucide-react';

const ImpactStatsSection = () => {
  const stats = [
    { 
      number: "15,000+", 
      label: "Meals Served", 
      icon: Utensils,
      image: "/lovable-uploads/6f2ea9c8-6aa2-4e26-aed2-414eb6492e76.png",
      caption: "Hot meals for thousands of families",
      hoverColor: "from-red-400 to-red-600"
    },
    { 
      number: "500+", 
      label: "Active Volunteers", 
      icon: Users,
      image: "/lovable-uploads/2a423765-9217-4c15-8508-367465a3b142.png",
      caption: "People making hope real every day",
      hoverColor: "from-blue-400 to-blue-600"
    },
    { 
      number: "50+", 
      label: "Community Hubs", 
      icon: HomeIcon,
      image: "/lovable-uploads/7eef4732-c8ab-4d01-af4c-dda5ef2b6f7a.png",
      caption: "Safe spaces across South Africa",
      hoverColor: "from-purple-400 to-purple-600"
    },
    { 
      number: "2,000kg", 
      label: "Food Saved Weekly", 
      icon: Package,
      image: "/lovable-uploads/bcd65d67-2626-4098-9418-116a59543abd.png",
      caption: "Fresh surplus rescued weekly",
      hoverColor: "from-green-400 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            <span className="text-gray-800">Our Community </span>
            <span className="text-green-600">Impact</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Together, we're changing lives daily, meal by meal, hub by hub across South African communities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group cursor-pointer"
            >
              <motion.div 
                className="bg-white/90 backdrop-blur-md border border-green-100 rounded-2xl p-6 shadow-lg transition-all duration-300 h-full relative overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  boxShadow: "0 25px 50px rgba(34, 197, 94, 0.25)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover Background Effect */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${stat.hoverColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-lg shadow-green-400/30 group-hover:shadow-lg group-hover:shadow-green-400/50 transition-all duration-300">
                    <motion.img 
                      src={stat.image} 
                      alt={stat.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      whileHover={{ scale: 1.1 }}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${stat.hoverColor} rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <stat.icon size={16} />
                  </motion.div>
                </div>
                
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.number.includes('+') ? (
                    <>
                      {stat.number.replace('+', '')}
                      <span className="text-green-400 group-hover:text-green-500 transition-colors duration-300">+</span>
                    </>
                  ) : stat.number}
                </motion.div>
                
                <div className="text-gray-700 font-medium mb-2 group-hover:text-gray-800 transition-colors duration-300">
                  {stat.label}
                </div>
                <p className="text-sm text-gray-500 italic group-hover:text-gray-600 transition-colors duration-300">
                  {stat.caption}
                </p>
                
                {/* Pulse Effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0.8 }}
                  whileHover={{ 
                    scale: 1,
                    opacity: [0, 1, 0],
                    transition: { duration: 0.8, repeat: Infinity }
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section with Banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/lovable-uploads/1c03dbd3-d693-4c6b-8f27-6b99367e1cbe.png')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-600/90"></div>
          <div className="relative z-10 text-center py-16 px-8">
            <motion.h3 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-white">Together We Feed </span>
              <span className="text-green-200">South Africa</span>
            </motion.h3>
            <motion.p 
              className="text-lg md:text-xl text-green-50 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Every surplus meal matters. Every volunteer hour counts. Every donation builds hope. 
              Join our community of changemakers turning waste into nourishment.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50 hover:scale-105 transition-all duration-300">
                <Link to="/volunteer">Get Started Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-green-600 hover:bg-white hover:text-green-600 hover:scale-105 transition-all duration-300">
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        
      </div>
    </section>
  );
};

export default ImpactStatsSection;
