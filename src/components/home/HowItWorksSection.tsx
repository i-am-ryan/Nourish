
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, HomeIcon, X } from 'lucide-react';

const HowItWorksSection = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const howItWorks = [
    { 
      title: "Surplus Collected", 
      description: "Local restaurants, shops and farms donate fresh, extra food to NourishSA hubs daily — no good meal goes to waste.",
      icon: Package,
      color: "from-green-400 to-green-600",
      image: "/lovable-uploads/85766eb1-bd48-4d84-9a32-fccdf86ae0bc.png",
      caption: "Colorful bags filled with donated surplus food"
    },
    { 
      title: "Sorted & Packed", 
      description: "Our local volunteers carefully sort, pack and prepare the food for quick, safe delivery to families.",
      icon: HomeIcon,
      color: "from-blue-400 to-blue-600",  
      image: "/lovable-uploads/f4453519-e5bb-4295-ab7a-fce40eae228c.png",
      caption: "Volunteers carefully packing food with care and attention"
    },
    { 
      title: "Meals Shared", 
      description: "Boxes of hope reach families in need — turning surplus into daily nourishment, dignity and community care.",
      icon: Truck,
      color: "from-orange-400 to-orange-600",
      image: "/lovable-uploads/bc00a394-a78d-471b-938b-0477ba11dbd1.png",
      caption: "Community members sharing meals together outdoors"
    }
  ];

  const closeModal = () => setSelectedStep(null);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            How <span className="text-green-600">NourishSA</span> Works
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A simple three-step journey from surplus to smiles — here's how we make good food reach families in need.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {howItWorks.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => setSelectedStep(index)}
            >
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 text-center h-full shadow-lg transition-all duration-300 overflow-hidden relative"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  boxShadow: "0 25px 50px rgba(34, 197, 94, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mb-6 relative">
                  <div className="overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <motion.img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      whileHover={{ scale: 1.1 }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <p className="text-white text-sm font-medium">
                        Click to find out more
                      </p>
                    </motion.div>
                  </div>
                </div>
                
                <motion.div 
                  className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <step.icon size={24} />
                </motion.div>
                
                <div className="w-16 h-1 bg-green-600 mx-auto mb-4 rounded-full"></div>
                
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-green-600 transition-colors duration-300">
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-500 italic mb-4 group-hover:text-gray-600 transition-colors duration-300">
                  Click to find out more
                </p>
                
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedStep !== null && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {howItWorks[selectedStep].title}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <img 
                    src={howItWorks[selectedStep].image} 
                    alt={howItWorks[selectedStep].title}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {howItWorks[selectedStep].description}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Together, this simple process means every extra plate feeds hope — not landfills.
          </p>
          <Button asChild size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-green-600/25 transition-all duration-300 ease-in-out group rounded-xl dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-gray-900">
            <Link to="/about">
              See How You Can Help
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

export default HowItWorksSection;
