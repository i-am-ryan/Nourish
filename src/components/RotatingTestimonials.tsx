
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    text: "NourishSA changed our community. We went from throwing away food to feeding 50 families every week.",
    author: "Sarah, Volunteer Coordinator",
    location: "Cape Town"
  },
  {
    text: "As a restaurant owner, partnering with NourishSA means our surplus food creates smiles instead of waste.",
    author: "Marcus, Restaurant Owner",
    location: "Johannesburg"
  },
  {
    text: "My children now have nutritious meals thanks to the local food hub. This program restored our dignity.",
    author: "Nomsa, Community Member",
    location: "Durban"
  },
  {
    text: "Our grocery store donations through NourishSA reach 200+ families monthly. It's business with purpose.",
    author: "Fatima, Store Manager",
    location: "Pretoria"
  },
  {
    text: "Volunteering with NourishSA connected me to my community. Every food parcel packed is hope shared.",
    author: "David, Weekend Volunteer",
    location: "Port Elizabeth"
  },
  {
    text: "Our farm surplus now feeds local schools. NourishSA turned our 'waste' into community nourishment.",
    author: "Jan, Local Farmer",
    location: "Stellenbosch"
  }
];

const RotatingTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto mb-6"
      >
        <p className="text-white/90 italic text-lg mb-2">
          "{testimonials[currentIndex].text}"
        </p>
        <p className="text-green-300 text-sm">
          - {testimonials[currentIndex].author}, {testimonials[currentIndex].location}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default RotatingTestimonials;
