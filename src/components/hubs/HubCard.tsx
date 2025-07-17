
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { MapPin, Clock, Phone, Users, Navigation } from 'lucide-react';

interface Hub {
  id: number;
  name: string;
  location: string;
  hours: string;
  phone: string;
  capacity: string;
  currentNeeds: string[];
  status: 'open' | 'busy' | 'urgent';
  image: string;
}

interface HubCardProps {
  hub: Hub;
}

const HubCard = ({ hub }: HubCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open & Available';
      case 'busy': return 'Busy';
      case 'urgent': return 'Urgent Help Needed';
      default: return 'Unknown';
    }
  };

  const handleGetDirections = () => {
    const encodedLocation = encodeURIComponent(hub.location);
    window.open(`https://maps.google.com/maps?q=${encodedLocation}`, '_blank');
  };

  const handleCallHub = () => {
    window.open(`tel:${hub.phone}`, '_self');
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="text-4xl mr-4">{hub.image}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{hub.name}</h3>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(hub.status)} mr-2`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {getStatusText(hub.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start text-gray-600">
            <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{hub.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-sm">{hub.hours}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-sm">{hub.phone}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-sm">{hub.capacity}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Current Needs:</h4>
          <div className="flex flex-wrap gap-2">
            {hub.currentNeeds.map((need, index) => (
              <Badge 
                key={index} 
                variant={hub.status === 'urgent' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {need}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleGetDirections}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
          <Button 
            onClick={handleCallHub}
            variant="outline" 
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Hub
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default HubCard;