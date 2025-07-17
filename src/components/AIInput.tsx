
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AIInput = () => {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      setMessage('');
    }, 2000);
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-green-600" size={20} />
          <span className="font-semibold text-gray-700">AI Assistant</span>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 ml-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zu">Zulu</SelectItem>
              <SelectItem value="af">Afrikaans</SelectItem>
              <SelectItem value="xh">Xhosa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask me anything about surplus food, donations, or community help..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AIInput;
