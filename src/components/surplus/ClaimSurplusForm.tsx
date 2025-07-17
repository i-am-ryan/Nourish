
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Building2, Church, UtensilsCrossed, Heart, GraduationCap, Users } from 'lucide-react';

interface ClaimSurplusFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ClaimSurplusForm = ({ onSubmit, onCancel }: ClaimSurplusFormProps) => {
  const [formData, setFormData] = useState({
    claimantType: '',
    name: '',
    contact: '',
    city: '',
    suburb: '',
    notes: ''
  });

  const claimantTypes = [
    { value: 'Households & Individuals', icon: Home, color: 'text-blue-600' },
    { value: 'Orphanage', icon: Heart, color: 'text-red-600' },
    { value: 'Church', icon: Church, color: 'text-purple-600' },
    { value: 'Community Kitchen', icon: UtensilsCrossed, color: 'text-orange-600' },
    { value: 'NGO', icon: Building2, color: 'text-green-600' },
    { value: 'School', icon: GraduationCap, color: 'text-indigo-600' },
    { value: 'Senior Center', icon: Users, color: 'text-gray-600' }
  ];

  const locationData = {
    'Johannesburg': ['Sandton', 'Rosebank', 'Soweto', 'Midrand', 'Alexandra', 'Johannesburg CBD', 'Tembisa'],
    'Pretoria': ['Pretoria Central', 'Centurion', 'Hatfield', 'Mamelodi', 'Sunnyside', 'Arcadia']
  };

  const handleCityChange = (city: string) => {
    setFormData({...formData, city, suburb: ''});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Claim Surplus Food
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Connect with local donors and get fresh surplus food for your community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">Organization Type</label>
          <Select value={formData.claimantType} onValueChange={(value) => setFormData({...formData, claimantType: value})}>
            <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              {claimantTypes.map(type => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value} className="rounded-lg my-1 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <span className="font-medium">{type.value}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Name */}
        <AnimatePresence>
          {formData.claimantType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {formData.claimantType === 'Households & Individuals' ? 'Your Name' : 'Organization Name'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={formData.claimantType === 'Households & Individuals' ? 'Enter your name' : 'Enter organization name'}
                className="h-14 rounded-2xl border-2 border-gray-200 focus:border-blue-400 transition-colors shadow-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact */}
        <AnimatePresence>
          {formData.name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">Contact Number</label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="WhatsApp number preferred"
                className="h-14 rounded-2xl border-2 border-gray-200 focus:border-blue-400 transition-colors shadow-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-Step Location Picker */}
        <AnimatePresence>
          {formData.contact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* City Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select City</label>
                <Select value={formData.city} onValueChange={handleCityChange}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                    <SelectValue placeholder="Choose your city" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                    {Object.keys(locationData).map(city => (
                      <SelectItem key={city} value={city} className="rounded-lg my-1 hover:bg-gray-50 font-medium">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Suburb Selection */}
              <AnimatePresence>
                {formData.city && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Suburb</label>
                    <Select value={formData.suburb} onValueChange={(value) => setFormData({...formData, suburb: value})}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Choose your suburb" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm max-h-60">
                        {locationData[formData.city as keyof typeof locationData]?.map(suburb => (
                          <SelectItem key={suburb} value={suburb} className="rounded-lg my-1 hover:bg-gray-50 font-medium">
                            {suburb}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special Notes */}
        <AnimatePresence>
          {formData.suburb && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">Special Notes (Optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special requirements or additional information..."
                className="rounded-2xl border-2 border-gray-200 focus:border-blue-400 transition-colors shadow-sm min-h-24 resize-none"
                rows={3}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {formData.suburb && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex space-x-4 pt-4"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 h-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300 font-semibold transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Submit Request
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default ClaimSurplusForm;
