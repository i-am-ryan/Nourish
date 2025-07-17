
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { MapPin } from 'lucide-react';

interface SuburbSelectorProps {
  onSuburbSelect: (suburb: string) => void;
}

const SuburbSelector = ({ onSuburbSelect }: SuburbSelectorProps) => {
  const johannesburgSuburbs = [
    'Sandton', 'Soweto', 'Midrand', 'Rosebank', 'Randburg', 
    'Alexandra', 'Johannesburg CBD', 'Braamfontein', 'Roodepoort'
  ];

  const pretoriaSuburbs = [
    'Pretoria Central', 'Hatfield', 'Mamelodi', 'Sunnyside', 
    'Arcadia', 'Centurion', 'Atteridgeville', 'Soshanguve'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Which area are you in?
        </h2>
        <p className="text-gray-600">
          Select your suburb to find nearby food hubs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Johannesburg */}
        <GlassCard>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Johannesburg</h3>
          </div>
          
          <div className="space-y-2">
            {johannesburgSuburbs.map((suburb) => (
              <Button
                key={suburb}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-blue-50"
                onClick={() => onSuburbSelect(suburb)}
              >
                {suburb}
              </Button>
            ))}
          </div>
        </GlassCard>

        {/* Pretoria */}
        <GlassCard>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Pretoria</h3>
          </div>
          
          <div className="space-y-2">
            {pretoriaSuburbs.map((suburb) => (
              <Button
                key={suburb}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-purple-50"
                onClick={() => onSuburbSelect(suburb)}
              >
                {suburb}
              </Button>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default SuburbSelector;