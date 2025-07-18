
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { Heart, Camera, MessageCircle } from 'lucide-react';

const CommunityFeed = () => {
  const impactMoments = [
    {
      id: 1,
       image: "/lovable-uploads/annie-spratt-cVEOh_JJmEE-unsplash.jpg",
      volunteer: 'Tebogo M.',
      action: 'delivered fresh vegetables to Soweto Community Kitchen',
      time: '2 hours ago',
      likes: 12,
      story: '"Seeing the smiles when fresh food arrives never gets old! 🥬✨"'
    },
    {
      id: 2,
      image: "/lovable-uploads/trung-manh-cong-RD8RDzQx1cE-unsplash.jpg",
      volunteer: 'Community Member',
      action: 'received food support from NourishSA',
      time: '5 hours ago',
      likes: 18,
      story: '"Thank you to all volunteers! This food came at the perfect time for our family. Your kindness means everything."'
    },
    {
      id: 3,
      image: "/lovable-uploads/anthony-georges-a2IM2snkO1Y-unsplash.jpg",
      volunteer: 'Mike R.',
      action: 'rescued 50kg of surplus bread from local bakery',
      time: '1 day ago',
      likes: 25,
      story: '"Instead of waste, we create hope. Every loaf saved is a family fed! 🍞❤️"'
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Impact Moments</h2>
        <p className="text-lg text-gray-600">Real stories from our volunteer community</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {impactMoments.map((moment, index) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <GlassCard className="overflow-hidden">
              {/* Image */}
              <div className="relative h-48 -m-6 mb-4">
                <img 
                  src={moment.image} 
                  alt="Community impact"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-green-600">
                  Impact Story
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {moment.volunteer.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{moment.volunteer}</span>
                    <span className="text-gray-600"> {moment.action}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 italic">{moment.story}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{moment.time}</span>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{moment.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Upload Your Moment CTA */}
      <motion.div 
        className="text-center mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <GlassCard className="max-w-md mx-auto">
          <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Impact</h3>
          <p className="text-gray-600 mb-4">Upload photos from your volunteer tasks and inspire others!</p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Camera className="w-4 h-4 mr-2" />
            Upload Moment
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CommunityFeed;