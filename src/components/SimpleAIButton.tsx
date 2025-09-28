import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { aiService } from '@/lib/aiService';

const SimpleAIButton: React.FC = () => {
  const handleClick = async () => {
    try {
      const response = await aiService.getChatResponse([{
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      }]);
      alert(`AI Response: ${response.message}`);
    } catch (error) {
      console.error('AI Error:', error);
      alert('AI service not configured yet');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl transition-all"
      title="AI Assistant"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </Button>
  );
};

export default SimpleAIButton;