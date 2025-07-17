
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Plus, Minus, Apple, Cake, Milk, UtensilsCrossed, ShoppingBasket, User, Building2, ChefHat, Tractor, Store, Church, Heart, HelpCircle } from 'lucide-react';

interface DonateSurplusFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const DonateSurplusForm = ({ onSubmit, onCancel }: DonateSurplusFormProps) => {
  const [formData, setFormData] = useState({
    donorType: '',
    businessName: '',
    foodType: '',
    customFoodType: '',
    description: '',
    quantity: 1,
    unit: 'kg',
    expiryDate: '',
    expiryTime: ''
  });

  const donorTypes = [
    { value: 'Individual', icon: User, color: 'text-blue-600' },
    { value: 'Business', icon: Building2, color: 'text-gray-600' },
    { value: 'Restaurant', icon: ChefHat, color: 'text-red-600' },
    { value: 'Farm', icon: Tractor, color: 'text-green-600' },
    { value: 'Retailer', icon: Store, color: 'text-purple-600' },
    { value: 'Church', icon: Church, color: 'text-indigo-600' },
    { value: 'NGO', icon: Building2, color: 'text-orange-600' },
    { value: 'Orphanage', icon: Heart, color: 'text-pink-600' },
    { value: 'Other', icon: HelpCircle, color: 'text-gray-500' }
  ];

  const foodTypes = [
    { value: 'Fresh Produce', icon: Apple, color: 'text-green-600', emoji: '🍎' },
    { value: 'Bakery Items', icon: Cake, color: 'text-amber-600', emoji: '🥖' },
    { value: 'Dairy Products', icon: Milk, color: 'text-blue-600', emoji: '🥛' },
    { value: 'Cooked Meals', icon: UtensilsCrossed, color: 'text-red-600', emoji: '🍽️' },
    { value: 'Non-Perishable', icon: ShoppingBasket, color: 'text-gray-600', emoji: '🥫' },
    { value: 'Other', icon: HelpCircle, color: 'text-gray-500', emoji: '❓' }
  ];

  const adjustQuantity = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showBusinessName = formData.donorType && formData.donorType !== 'Individual';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Donate Surplus Food
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Help reduce waste by sharing your surplus food with those in need
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">Donor Type</label>
          <Select value={formData.donorType} onValueChange={(value) => setFormData({...formData, donorType: value, businessName: ''})}>
            <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-200 hover:border-green-300 transition-colors shadow-sm">
              <SelectValue placeholder="Select donor type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              {donorTypes.map(type => {
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

        {/* Business/Individual Name */}
        <AnimatePresence>
          {formData.donorType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {formData.donorType === 'Individual' ? 'Your Name' : 'Business/Organization Name'}
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                placeholder={formData.donorType === 'Individual' ? 'Enter your name' : 'Enter business/organization name'}
                className="h-14 rounded-2xl border-2 border-gray-200 focus:border-green-400 transition-colors shadow-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food Type - Radio Buttons */}
        <AnimatePresence>
          {formData.businessName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-4">Food Type</label>
              <RadioGroup 
                value={formData.foodType} 
                onValueChange={(value) => setFormData({...formData, foodType: value, customFoodType: ''})}
                className="grid grid-cols-2 gap-3"
              >
                {foodTypes.map((type) => (
                  <motion.div 
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.foodType === type.value 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      <RadioGroupItem value={type.value} className="sr-only" />
                      <span className="text-2xl mr-3">{type.emoji}</span>
                      <span className="font-medium text-gray-700">{type.value}</span>
                    </label>
                  </motion.div>
                ))}
              </RadioGroup>

              {/* Custom Food Type Input */}
              <AnimatePresence>
                {formData.foodType === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Input
                      value={formData.customFoodType}
                      onChange={(e) => setFormData({...formData, customFoodType: e.target.value})}
                      placeholder="Please describe the food item..."
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-green-400 transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantity */}
        <AnimatePresence>
          {formData.foodType && (formData.foodType !== 'Other' || formData.customFoodType) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(-1)}
                  className="h-14 w-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold text-gray-700">{formData.quantity}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(1)}
                  className="h-14 w-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger className="w-36 h-14 rounded-2xl border-2 border-gray-200 hover:border-green-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="items">items</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                    <SelectItem value="portions">portions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expiry Date & Time */}
        <AnimatePresence>
          {formData.quantity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expiry Date</label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="h-14 rounded-2xl border-2 border-gray-200 focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expiry Time</label>
                <Input
                  type="time"
                  value={formData.expiryTime}
                  onChange={(e) => setFormData({...formData, expiryTime: e.target.value})}
                  className="h-14 rounded-2xl border-2 border-gray-200 focus:border-green-400 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Image */}
        <AnimatePresence>
          {formData.expiryDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Photo (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        <AnimatePresence>
          {formData.expiryDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description (Optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the food items, condition, any special notes..."
                className="rounded-2xl border-2 border-gray-200 focus:border-green-400 transition-colors min-h-24 resize-none"
                rows={3}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {formData.expiryDate && (
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
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Donate Surplus
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default DonateSurplusForm;
